---
name: by-my-side
description: Use when a user asks to create, install, start, repair, or verify a desktop-to-WeChat Codex connection; says 创建桌面端到微信的连接, 把 Codex 接到微信, 微信桥, WeChat bridge, 扫码连接; or wants a persistent macOS LaunchAgent / Windows Task Scheduler bridge from WeChat iLink messages to local Codex.
---

# By My Side

By My Side connects personal WeChat messages to local Codex through the bundled `codex-wechat-bridge` source under `vendor/codex-wechat-bridge`. The skill should get the user to the QR-code login step, teach them how to scan, install a persistent service, and verify the bridge without copying any private runtime state.

## Hard Boundaries

- Never copy, print, upload, or commit `account.json`, `context_tokens.json`, `sync_cursor.json`, logs, or downloaded assets.
- Never claim login is complete until `codex-wechat-bridge status` reports `hasWechatToken: true`.
- WeChat authorization requires the user to scan and confirm. Do not imply the skill can bypass that.
- Use the bundled bridge project's own CLI and service script. Do not hand-roll LaunchAgent or Task Scheduler files in the skill.
- If the bundled bridge files are missing or incomplete, recover them by pulling `Stormycry-cryp/codexapp-wechat-bridge` from GitHub into `vendor/codex-wechat-bridge`, then continue. Do not substitute a similar bridge.
- If iLink token setup fails, say so plainly. There is no enterprise WeChat fallback in this bridge.

## Quick Path

For “创建桌面端到微信的连接” or equivalent, run:

```bash
node <skill-folder>/scripts/by-my-side.mjs connect --workspace <absolute-workspace-path>
```

Use the current working directory as `--workspace` only when the user did not name a target workspace and that directory is a reasonable Codex project.

The command:

1. Uses the bundled `vendor/codex-wechat-bridge` project unless `--bridge-dir` explicitly points to an external checkout.
2. If bundled bridge files are missing, pulls `Stormycry-cryp/codexapp-wechat-bridge` from GitHub into the vendor directory.
3. Runs `npm install` when `node_modules/` is missing.
4. Runs `npm run build`.
5. Checks bridge status.
6. If no WeChat token exists, runs setup and waits for the user to scan.
7. Installs or restarts the persistent service.
8. Prints verification steps.

## Commands

Detect bridge checkout and local state:

```bash
node <skill-folder>/scripts/by-my-side.mjs detect
```

Show bridge status:

```bash
node <skill-folder>/scripts/by-my-side.mjs status --workspace <path>
```

Run QR setup only:

```bash
node <skill-folder>/scripts/by-my-side.mjs setup --workspace <path>
```

Install persistent service only:

```bash
node <skill-folder>/scripts/by-my-side.mjs install-service --workspace <path>
```

Preview service installation:

```bash
node <skill-folder>/scripts/by-my-side.mjs install-service --workspace <path> --dry-run
```

## Scan Teaching

When setup prints a QR URL or QR payload:

1. Keep the terminal running.
2. Open the printed URL on a screen WeChat can scan, or copy it into a browser if it is a URL.
3. Use the same personal WeChat account that should own the bridge.
4. Confirm login in WeChat.
5. Wait until the terminal says the iLink account is configured.
6. Send any message to the bridge in WeChat once; then send `/status` and `/help`.

If setup times out, rerun `setup` or `connect`; the old QR code may have expired.

## Verification

After changes or setup, run from the bridge checkout:

```bash
npm test
npm run typecheck
npm run build
node scripts/service.mjs status --dry-run
node dist/cli.js status --cwd <workspace>
```

For a real local install on macOS, `node scripts/service.mjs status` should show `state = running` after installation. On Windows, it should query the `CodexWechatBridge` scheduled task.

## References

- `references/scan-guide.md`: user-facing scan and first-message guidance.
