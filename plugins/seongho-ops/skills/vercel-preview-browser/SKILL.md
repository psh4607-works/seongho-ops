---
name: vercel-preview-browser
description: Use when a protected Vercel preview must be opened or tested in the ChatGPT/Codex Desktop in-app browser, especially when Vercel Authentication blocks a *.vercel.app deployment and the authenticated Vercel CLI should seed a bypass cookie without exposing the secret.
---

# Vercel Preview Browser

Open protected Vercel deployments in the Codex in-app browser by composing the
authenticated local Vercel CLI with the bundled Browser plugin.

## Required skills

1. Load `seongho-ops:cli-routing` before checking or running Vercel CLI.
2. Load `browser:control-in-app-browser` and follow its complete setup and
   browser-selection instructions.
3. Select the in-app browser explicitly with `agent.browsers.get("iab")`.

## Preconditions

- Use `command -v vercel`, the narrowest `vercel curl --help`, and
  `vercel whoami` to verify the installed command and current authentication.
- Accept only an explicit HTTPS `*.vercel.app` deployment URL. Do not guess URL
  variants or accept a custom domain through this helper.
- Treat Vercel Deployment Protection and application login as separate layers.

If Vercel CLI authentication is genuinely missing or expired, follow the auth
recovery reference from `seongho-ops:cli-routing` before starting a login.

## Runtime workflow

Resolve the plugin root as two directories above this `SKILL.md`, then import
`runtime/vercel-preview-iab.js` from that root in the same Node session that
holds the selected in-app-browser binding.

```js
var vercelPreviewRuntime = await import(
  "/absolute/plugin/root/runtime/vercel-preview-iab.js"
);
var vercelPreviewResult = await vercelPreviewRuntime.openVercelPreviewInIab({
  browser: iab,
  url: "https://deployment.vercel.app/"
});
globalThis.tab = vercelPreviewResult.tab;
```

The helper performs the sensitive sequence internally:

1. Run `vercel curl` with `x-vercel-set-bypass-cookie: true`.
2. Capture the Vercel authorization cookie in a mode-0700 temporary directory.
3. Navigate a fresh IAB tab to establish the intended HTTP origin.
4. Inject only the expected Vercel bypass cookie with the permitted
   `Network.setCookie` CDP command.
5. Navigate to the requested URL again and delete the temporary cookie jar.

For an iframe-only target, pass `cookieMode: "none"`; the normal default is
`"lax"`.

## Verification

- Verify the final tab with a fresh screenshot or a narrowly scoped DOM check.
- A product login form means Vercel Deployment Protection was bypassed and the
  separate application session is missing.
- When product login is necessary, follow the Browser plugin's `browserAuth`
  workflow. Never copy credentials or application cookies from another browser
  profile.
- Report success only when the target deployment host is loaded. State that a
  Vercel bypass cookie was added to the in-app browser.

## Secret handling

- Never print, return, or persist the bypass cookie or Vercel auth token.
- Never put the bypass secret in a URL, query parameter, shell output, log, or
  chat message.
- Never inspect the user's browser cookies, local storage, profile database, or
  password manager.
- Do not replace the packaged helper with ad-hoc cookie parsing in model-visible
  tool output.

The helper returns only the controlled tab, target URL, and injected cookie
count. It removes its temporary cookie jar even when the operation fails.
