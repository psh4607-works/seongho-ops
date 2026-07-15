import assert from 'node:assert/strict';
import { chmod, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('..', import.meta.url));
const runtimePath = path.join(
  root,
  'plugins',
  'seongho-ops',
  'runtime',
  'vercel-preview-iab.js',
);

async function executable(file, contents) {
  await writeFile(file, contents, 'utf8');
  await chmod(file, 0o755);
}

async function fixture(t, options = {}) {
  const temp = await mkdtemp(path.join(tmpdir(), 'seongho-ops-vercel-iab-test-'));
  t.after(() => rm(temp, { recursive: true, force: true }));
  const tempRoot = path.join(temp, 'runtime-temp');
  const callsFile = path.join(temp, 'calls.json');
  const command = path.join(temp, 'fake-vercel.mjs');
  await mkdir(tempRoot);

  await executable(
    command,
    `#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
const args = process.argv.slice(2);
${options.fail ? "process.stderr.write('SENSITIVE_FAKE_STDERR\\n'); process.exit(2);" : ''}
const jarIndex = args.indexOf('--cookie-jar');
const hostname = new URL(args[1]).hostname;
writeFileSync(${JSON.stringify(callsFile)}, JSON.stringify(args));
writeFileSync(
  args[jarIndex + 1],
  '# Netscape HTTP Cookie File\\n' +
    '#HttpOnly_' + hostname + '\\tFALSE\\t/\\tTRUE\\t2147483647\\t' +
    ${JSON.stringify(options.cookieName ?? '_vercel_jwt')} + '\\tFAKE_COOKIE_VALUE\\n'
);
`,
  );

  const gotoCalls = [];
  const cdpCalls = [];
  let closed = false;
  const tab = {
    capabilities: {
      async get(id) {
        assert.equal(id, 'cdp');
        return {
          async send(method, params) {
            cdpCalls.push({ method, params });
            return { success: true };
          },
        };
      },
    },
    async close() {
      closed = true;
    },
    async goto(url) {
      gotoCalls.push(url);
    },
  };
  const browser = { tabs: { async new() { return tab; } } };

  return {
    browser,
    callsFile,
    cdpCalls,
    command,
    get closed() { return closed; },
    gotoCalls,
    tempRoot,
  };
}

test('opens a protected preview without returning the cookie value', async (t) => {
  const f = await fixture(t);
  const runtime = await import(`${pathToFileURL(runtimePath).href}?test=${Date.now()}`);
  const url = 'https://example-preview.vercel.app/console';
  const result = await runtime.openVercelPreviewInIab({
    browser: f.browser,
    tempRoot: f.tempRoot,
    url,
    vercelCommand: f.command,
  });

  assert.equal(result.injectedCookieCount, 1);
  assert.equal(result.targetUrl, url);
  assert.equal('cookie' in result, false);
  assert.deepEqual(f.gotoCalls, [url, url]);
  assert.equal(f.cdpCalls.length, 1);
  assert.equal(f.cdpCalls[0].method, 'Network.setCookie');
  assert.equal(f.cdpCalls[0].params.name, '_vercel_jwt');
  assert.equal(f.cdpCalls[0].params.sameSite, 'Lax');
  assert.equal(f.cdpCalls[0].params.url, 'https://example-preview.vercel.app/');

  const args = JSON.parse(await readFile(f.callsFile, 'utf8'));
  assert.deepEqual(args.slice(0, 3), ['curl', url, '--yes']);
  assert.ok(args.includes('x-vercel-set-bypass-cookie: true'));
  assert.equal(args.includes('FAKE_COOKIE_VALUE'), false);
  assert.deepEqual(await readdir(f.tempRoot), []);
});

test('rejects non-Vercel URLs before opening a browser tab', async () => {
  const runtime = await import(`${pathToFileURL(runtimePath).href}?invalid=${Date.now()}`);
  let opened = false;

  await assert.rejects(
    runtime.openVercelPreviewInIab({
      browser: { tabs: { async new() { opened = true; } } },
      url: 'https://example.com/',
    }),
    /Only \*\.vercel\.app deployment URLs are supported/,
  );
  assert.equal(opened, false);
});

test('sanitizes Vercel CLI failures and removes temporary files', async (t) => {
  const f = await fixture(t, { fail: true });
  const runtime = await import(`${pathToFileURL(runtimePath).href}?failure=${Date.now()}`);

  await assert.rejects(
    runtime.openVercelPreviewInIab({
      browser: f.browser,
      tempRoot: f.tempRoot,
      url: 'https://example-preview.vercel.app/',
      vercelCommand: f.command,
    }),
    (error) => {
      assert.match(error.message, /verify Vercel CLI authentication and deployment access/);
      assert.doesNotMatch(error.message, /SENSITIVE_FAKE_STDERR/);
      return true;
    },
  );
  assert.deepEqual(await readdir(f.tempRoot), []);
});

test('rejects unexpected cookies without exposing their values', async (t) => {
  const f = await fixture(t, { cookieName: 'unexpected_cookie' });
  const runtime = await import(`${pathToFileURL(runtimePath).href}?cookie=${Date.now()}`);

  await assert.rejects(
    runtime.openVercelPreviewInIab({
      browser: f.browser,
      tempRoot: f.tempRoot,
      url: 'https://example-preview.vercel.app/',
      vercelCommand: f.command,
    }),
    (error) => {
      assert.match(error.message, /expected deployment-protection cookie/);
      assert.doesNotMatch(error.message, /FAKE_COOKIE_VALUE/);
      return true;
    },
  );
  assert.equal(f.closed, false);
  assert.deepEqual(await readdir(f.tempRoot), []);
});
