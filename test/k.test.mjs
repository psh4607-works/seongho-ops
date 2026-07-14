import assert from 'node:assert/strict';
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('..', import.meta.url));
const command = path.join(root, 'plugins', 'seongho-ops', 'bin', 'k.js');

async function executable(file, contents) {
  await writeFile(file, contents, 'utf8');
  await chmod(file, 0o755);
}

test('k reports usage without touching process tools when no port is supplied', () => {
  const result = spawnSync(process.execPath, [command], { encoding: 'utf8' });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /usage: k <port> \[port\.\.\.\]/);
});
test('k force-kills every pid returned for an explicitly supplied port', async (t) => {
  const temp = await mkdtemp(path.join(tmpdir(), 'seongho-ops-k-'));
  t.after(() => rm(temp, { recursive: true, force: true }));

  const fakeBin = path.join(temp, 'bin');
  const calls = path.join(temp, 'kill-calls.txt');
  await mkdir(fakeBin);

  await executable(
    path.join(fakeBin, 'lsof'),
    '#!/usr/bin/env bash\nprintf "123\\n456\\n"\n',
  );
  await executable(
    path.join(fakeBin, 'kill'),
    '#!/usr/bin/env bash\nprintf "%s\\n" "$*" >> "$SEONGHO_OPS_K_CALLS"\n',
  );

  const result = spawnSync(process.execPath, [command, '4317'], {
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${fakeBin}:${process.env.PATH}`,
      SEONGHO_OPS_K_CALLS: calls,
    },
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /killed port 4317 \(pid: 123, 456\)/);
  assert.deepEqual((await readFile(calls, 'utf8')).trim().split('\n'), ['-9 123', '-9 456']);
});
