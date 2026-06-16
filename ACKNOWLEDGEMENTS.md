# Acknowledgements

By My Side ships a bundled `codex-wechat-bridge` project and uses several open source projects and public specifications.

## Open Source Projects

- [cc-connect](https://github.com/chenhg5/cc-connect) — an open source bridge for connecting local AI coding agents to messaging platforms. By My Side was inspired by its idea of making local coding agents reachable from everyday chat tools, while focusing this Skill on Codex Desktop and personal WeChat setup.
- [Node.js](https://nodejs.org/) — JavaScript runtime used by the bundled bridge and skill helper scripts.
- [TypeScript](https://www.typescriptlang.org/) — typed implementation language for `codex-wechat-bridge`.
- [Vitest](https://vitest.dev/) — test runner for the bridge test suite.
- [tsx](https://github.com/privatenumber/tsx) — local TypeScript execution helper used during bridge development.
- [@types/node](https://github.com/DefinitelyTyped/DefinitelyTyped) — Node.js type definitions.

## Open Specifications And Local Platform Facilities

- [Agent Skills](https://agentskills.io/) — `SKILL.md` structure and packaging convention.
- macOS LaunchAgent / `launchctl` — user-level background service mechanism on macOS.
- Windows Task Scheduler / `schtasks` — login-started background task mechanism on Windows.

## Product And Service Context

This project is designed for Codex Desktop users and connects to personal WeChat iLink through the bundled bridge. Codex, WeChat, and iLink are product or service contexts for this workflow; they are not claimed here as bundled open source dependencies.

Runtime files such as `account.json`, `context_tokens.json`, `sync_cursor.json`, logs, and downloaded assets are user-local state and are intentionally not included in this repository.
