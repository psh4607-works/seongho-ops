import { execFile } from 'node:child_process';
import { chmod, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

type CdpResult = { success?: boolean } | undefined;

interface CdpCapability {
  send(method: string, params?: Record<string, unknown>): Promise<CdpResult>;
}

interface BrowserTab {
  capabilities: {
    get(id: string): Promise<CdpCapability>;
  };
  close(): Promise<void>;
  goto(url: string): Promise<void>;
}

interface InAppBrowser {
  tabs: {
    new: () => Promise<BrowserTab>;
  };
}

interface ParsedCookie {
  domain: string;
  expires?: number;
  httpOnly: boolean;
  name: string;
  path: string;
  secure: boolean;
  value: string;
}

export interface OpenVercelPreviewOptions {
  browser: InAppBrowser;
  cookieMode?: 'lax' | 'none';
  tempRoot?: string;
  url: string;
  vercelCommand?: string;
}

export interface OpenVercelPreviewResult {
  injectedCookieCount: number;
  tab: BrowserTab;
  targetUrl: string;
}

const BYPASS_COOKIE_NAME = '_vercel_jwt';

function targetUrl(input: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    throw new Error('A valid Vercel preview URL is required.');
  }

  if (parsed.protocol !== 'https:') {
    throw new Error('Vercel preview access requires an HTTPS URL.');
  }
  if (parsed.hostname !== 'vercel.app' && !parsed.hostname.endsWith('.vercel.app')) {
    throw new Error('Only *.vercel.app deployment URLs are supported.');
  }

  return parsed;
}

function cookieDomainMatches(hostname: string, domain: string): boolean {
  const normalized = domain.replace(/^\./, '').toLowerCase();
  return hostname === normalized || hostname.endsWith(`.${normalized}`);
}

function parseBypassCookies(cookieJar: string, hostname: string): ParsedCookie[] {
  return cookieJar
    .split('\n')
    .filter((line) => line && (!line.startsWith('#') || line.startsWith('#HttpOnly_')))
    .flatMap((line) => {
      const httpOnly = line.startsWith('#HttpOnly_');
      const fields = line.split('\t');
      if (fields.length < 7) return [];

      const domain = fields[0].replace(/^#HttpOnly_/, '');
      const expires = Number(fields[4]);
      const cookie: ParsedCookie = {
        domain,
        expires: Number.isFinite(expires) && expires > 0 ? expires : undefined,
        httpOnly,
        name: fields[5],
        path: fields[2] || '/',
        secure: fields[3] === 'TRUE',
        value: fields.slice(6).join('\t'),
      };

      if (cookie.name !== BYPASS_COOKIE_NAME) return [];
      if (!cookieDomainMatches(hostname, cookie.domain)) return [];
      if (!cookie.value) return [];
      return [cookie];
    });
}

function runVercelCurl(
  command: string,
  url: string,
  cookieJar: string,
  cookieMode: 'lax' | 'none',
): Promise<void> {
  const setCookieValue = cookieMode === 'none' ? 'samesitenone' : 'true';
  const args = [
    'curl',
    url,
    '--yes',
    '--',
    '--location',
    '--silent',
    '--show-error',
    '--header',
    `x-vercel-set-bypass-cookie: ${setCookieValue}`,
    '--cookie-jar',
    cookieJar,
    '--output',
    '/dev/null',
  ];

  return new Promise((resolve, reject) => {
    execFile(command, args, { maxBuffer: 1024 * 1024 }, (error) => {
      if (!error) {
        resolve();
        return;
      }

      const code = (error as NodeJS.ErrnoException).code;
      if (code === 'ENOENT') {
        reject(new Error('Vercel CLI was not found on PATH.'));
        return;
      }
      reject(new Error('vercel curl failed; verify Vercel CLI authentication and deployment access.'));
    });
  });
}

export async function openVercelPreviewInIab({
  browser,
  cookieMode = 'lax',
  tempRoot = tmpdir(),
  url,
  vercelCommand = 'vercel',
}: OpenVercelPreviewOptions): Promise<OpenVercelPreviewResult> {
  const target = targetUrl(url);
  const tempDirectory = await mkdtemp(path.join(tempRoot, 'seongho-ops-vercel-iab-'));
  await chmod(tempDirectory, 0o700);
  const cookieJar = path.join(tempDirectory, 'cookies.txt');
  let tab: BrowserTab | undefined;

  try {
    await runVercelCurl(vercelCommand, target.href, cookieJar, cookieMode);
    const cookies = parseBypassCookies(await readFile(cookieJar, 'utf8'), target.hostname);
    if (cookies.length === 0) {
      throw new Error('Vercel CLI did not return the expected deployment-protection cookie.');
    }

    const openedTab = await browser.tabs.new();
    tab = openedTab;
    await openedTab.goto(target.href);
    const cdp = await openedTab.capabilities.get('cdp');

    for (const cookie of cookies) {
      const result = await cdp.send('Network.setCookie', {
        name: cookie.name,
        value: cookie.value,
        url: target.origin + '/',
        path: cookie.path,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: cookieMode === 'none' ? 'None' : 'Lax',
        ...(cookie.expires ? { expires: cookie.expires } : {}),
      });
      if (result?.success !== true) {
        throw new Error('The Codex in-app browser rejected the Vercel bypass cookie.');
      }
    }

    await openedTab.goto(target.href);
    return {
      injectedCookieCount: cookies.length,
      tab: openedTab,
      targetUrl: target.href,
    };
  } catch (error) {
    if (tab) await tab.close().catch(() => undefined);
    throw error;
  } finally {
    await rm(tempDirectory, { recursive: true, force: true });
  }
}
