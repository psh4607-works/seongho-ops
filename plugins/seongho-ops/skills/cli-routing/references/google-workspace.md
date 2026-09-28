# Google Workspace with gogcli

The package is `gogcli`; its executable is `gog`. Prefer it for supported Gmail, Calendar, Drive, Docs, Sheets, and other Google Workspace operations. Keep an explicitly requested tool such as `gws`; inspect `gog <service> --help` before assuming a capability is unavailable. Other email providers need their own route.

## Account and authentication

- Check `command -v gog`, `gog --version`, and the relevant command's `--help`.
- Inspect `gog auth status --json --no-input` and `gog auth list --json --no-input`. Stored credentials alone do not prove current API access; verify with a small read in the requested service.
- Select the intended account with `--account <email-or-alias>`, especially when several accounts are connected. Do not guess the sender account.
- If authentication is missing or expired, read [auth-recovery.md](auth-recovery.md) before setup or login. Use `gog auth setup --help` and `gog auth add --help` for the installed version and authorize only the needed services. CLI installation alone does not connect an account.
- Prefer `--json --no-input` for agent calls. Use `--readonly` for read-only work; `--gmail-no-send` allows draft work while blocking send operations.

## Gmail workflow

- Search with `gog gmail search '<Gmail query>' --json`; read the selected message with `gog gmail get <messageId>` or its conversation with `gog gmail thread get <threadId>`. Keep message, thread, and draft IDs distinct.
- Use `gog gmail drafts create` for a new draft and `gog gmail drafts reply <messageId>` for a reply draft in the requested conversation. Use `--body-file` or `--body-html-file` for multiline content. Retrieve the saved draft to verify it.
- For an authorized send, use `gog gmail send`, `gog gmail reply`, or `gog gmail drafts send` as appropriate. Check the sender, recipients, body, and attachments. Verify the send response and, when read access is available, retrieve the returned message ID. A sent message does not prove recipient delivery.
- Keep existing reply subjects when the user wants the same conversation. Changing the subject can create a new Gmail thread.

Inspect command-specific help for required flags. Reference: [gogcli Gmail workflows](https://gogcli.sh/gmail-workflows.html).
