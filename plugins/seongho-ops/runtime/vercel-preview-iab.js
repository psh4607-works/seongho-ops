// src/runtime/vercel-preview-iab.ts
import { execFile } from "child_process";
import { chmod, mkdtemp, readFile, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
var BYPASS_COOKIE_NAME = "_vercel_jwt";
function targetUrl(input) {
  let parsed;
  try {
    parsed = new URL(input);
  } catch {
    throw new Error("A valid Vercel preview URL is required.");
  }
  if (parsed.protocol !== "https:") {
    throw new Error("Vercel preview access requires an HTTPS URL.");
  }
  if (parsed.hostname !== "vercel.app" && !parsed.hostname.endsWith(".vercel.app")) {
    throw new Error("Only *.vercel.app deployment URLs are supported.");
  }
  return parsed;
}
function cookieDomainMatches(hostname, domain) {
  const normalized = domain.replace(/^\./, "").toLowerCase();
  return hostname === normalized || hostname.endsWith(`.${normalized}`);
}
function parseBypassCookies(cookieJar, hostname) {
  return cookieJar.split("\n").filter((line) => line && (!line.startsWith("#") || line.startsWith("#HttpOnly_"))).flatMap((line) => {
    const httpOnly = line.startsWith("#HttpOnly_");
    const fields = line.split("	");
    if (fields.length < 7) return [];
    const domain = fields[0].replace(/^#HttpOnly_/, "");
    const expires = Number(fields[4]);
    const cookie = {
      domain,
      expires: Number.isFinite(expires) && expires > 0 ? expires : void 0,
      httpOnly,
      name: fields[5],
      path: fields[2] || "/",
      secure: fields[3] === "TRUE",
      value: fields.slice(6).join("	")
    };
    if (cookie.name !== BYPASS_COOKIE_NAME) return [];
    if (!cookieDomainMatches(hostname, cookie.domain)) return [];
    if (!cookie.value) return [];
    return [cookie];
  });
}
function runVercelCurl(command, url, cookieJar, cookieMode) {
  const setCookieValue = cookieMode === "none" ? "samesitenone" : "true";
  const args = [
    "curl",
    url,
    "--yes",
    "--",
    "--location",
    "--silent",
    "--show-error",
    "--header",
    `x-vercel-set-bypass-cookie: ${setCookieValue}`,
    "--cookie-jar",
    cookieJar,
    "--output",
    "/dev/null"
  ];
  return new Promise((resolve, reject) => {
    execFile(command, args, { maxBuffer: 1024 * 1024 }, (error) => {
      if (!error) {
        resolve();
        return;
      }
      const code = error.code;
      if (code === "ENOENT") {
        reject(new Error("Vercel CLI was not found on PATH."));
        return;
      }
      reject(new Error("vercel curl failed; verify Vercel CLI authentication and deployment access."));
    });
  });
}
async function openVercelPreviewInIab({
  browser,
  cookieMode = "lax",
  tempRoot = tmpdir(),
  url,
  vercelCommand = "vercel"
}) {
  const target = targetUrl(url);
  const tempDirectory = await mkdtemp(path.join(tempRoot, "seongho-ops-vercel-iab-"));
  await chmod(tempDirectory, 448);
  const cookieJar = path.join(tempDirectory, "cookies.txt");
  let tab;
  try {
    await runVercelCurl(vercelCommand, target.href, cookieJar, cookieMode);
    const cookies = parseBypassCookies(await readFile(cookieJar, "utf8"), target.hostname);
    if (cookies.length === 0) {
      throw new Error("Vercel CLI did not return the expected deployment-protection cookie.");
    }
    const openedTab = await browser.tabs.new();
    tab = openedTab;
    await openedTab.goto(target.href);
    const cdp = await openedTab.capabilities.get("cdp");
    for (const cookie of cookies) {
      const result = await cdp.send("Network.setCookie", {
        name: cookie.name,
        value: cookie.value,
        url: target.origin + "/",
        path: cookie.path,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: cookieMode === "none" ? "None" : "Lax",
        ...cookie.expires ? { expires: cookie.expires } : {}
      });
      if (result?.success !== true) {
        throw new Error("The Codex in-app browser rejected the Vercel bypass cookie.");
      }
    }
    await openedTab.goto(target.href);
    return {
      injectedCookieCount: cookies.length,
      tab: openedTab,
      targetUrl: target.href
    };
  } catch (error) {
    if (tab) await tab.close().catch(() => void 0);
    throw error;
  } finally {
    await rm(tempDirectory, { recursive: true, force: true });
  }
}
export {
  openVercelPreviewInIab
};
