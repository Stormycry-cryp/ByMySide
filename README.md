<div align="center">

# By My Side

#### 一个把 Codex 桌面端接到个人微信的本地 Skill

[![AgentSkills](https://img.shields.io/badge/AgentSkills-Standard-8B5CF6?style=for-the-badge)](https://agentskills.io)
[![Codex](https://img.shields.io/badge/Codex-Skill-10B981?style=for-the-badge&logo=openai&logoColor=white)](#安装方式)
[![Local First](https://img.shields.io/badge/Local_First-WeChat_Bridge-10B981?style=for-the-badge)](#数据和隐私)

![macOS](https://img.shields.io/badge/macOS-LaunchAgent-111827?style=flat-square&logo=apple&logoColor=white)
![Windows](https://img.shields.io/badge/Windows-Task_Scheduler-2563EB?style=flat-square&logo=windows&logoColor=white)
![WeChat](https://img.shields.io/badge/WeChat-iLink-07C160?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-20+-16A34A?style=flat-square&logo=node.js&logoColor=white)

</div>

我自己用来把 Codex 接到微信的一套 Skill。

它不是另一个聊天机器人平台，也不负责托管云服务。它做的事情很窄：Skill 自带 `codex-wechat-bridge` 源码，让 Agent 直接构建、带你扫个人微信 iLink 登录二维码，然后把 bridge 注册成登录后自动运行的本地后台服务。

你可以直接对 Agent 说：

```text
创建桌面端到微信的连接
```

Agent 应该会做这些事：

1. 使用 Skill 内置的 `codex-wechat-bridge`。
2. 安装依赖并构建。
3. 如果还没绑定微信，就打印二维码并教你扫码。
4. 扫码成功后注册持久化后台服务。
5. 告诉你在微信里发 `/status` 和 `/help` 验证。

扫码这一步必须由你自己完成。Skill 不会、也不应该绕过微信授权。

---

## 它解决什么

桌面端到微信的连接，麻烦点通常不在代码，而在这几步容易漏：

- 要先构建 bridge，再运行 setup。
- 二维码可能是 URL，也可能是载荷，需要知道怎么扫。
- macOS 要 LaunchAgent，Windows 要任务计划程序。
- 不能复制别人的 `account.json`，也不能把 token 发到仓库。
- build 后要重启后台服务，否则运行的还是旧 `dist`。

By My Side 的思路很简单：  
**让 Skill 负责连接流程，让内置 `codex-wechat-bridge` 项目负责真正的桥接和持久化运行。**

它会调用内置桥项目自己的 CLI：

- `node dist/cli.js setup`
- `node dist/cli.js status`
- `node scripts/service.mjs install`
- `node scripts/service.mjs status`

所以持久化启动逻辑在内置桥项目内，不藏在 Skill 脚本里。

---

## 安装方式

在支持 `SKILL.md` / Agent Skills 结构的 Agent 里直接说：

```text
帮我安装这个 skill：https://github.com/Stormycry-cryp/ByMySide/tree/main/by-my-side
```

如果要手动安装，常见目录如下：

| Agent | 常见安装目录 |
|---|---|
| Codex | `~/.codex/skills/by-my-side` |
| Claude Code | `~/.claude/skills/by-my-side` |
| OpenCode | `~/.config/opencode/skills/by-my-side` |
| OpenClaw | `~/.openclaw/skills/by-my-side` |
| 其他 Agent | 放到它能扫描 `SKILL.md` 的 skills 目录 |

macOS 示例：

```bash
git clone https://github.com/Stormycry-cryp/ByMySide.git
mkdir -p ~/.codex/skills
cp -R ByMySide/by-my-side ~/.codex/skills/by-my-side
```

Windows PowerShell 示例：

```powershell
git clone https://github.com/Stormycry-cryp/ByMySide.git
New-Item -ItemType Directory -Force "$env:USERPROFILE\.codex\skills" | Out-Null
Copy-Item -Recurse -Force .\ByMySide\by-my-side "$env:USERPROFILE\.codex\skills\by-my-side"
```

---

## 怎么用

第一次使用，跟 Agent 说：

```text
创建桌面端到微信的连接
```

Agent 会调用：

```bash
node <by-my-side-skill-folder>/scripts/by-my-side.mjs connect \
  --workspace /absolute/path/to/default-workspace
```

如果还没有微信 token，终端会进入扫码等待。你需要：

1. 保持终端运行。
2. 用个人微信扫描打印出来的二维码或打开二维码 URL。
3. 在微信里确认登录。
4. 等终端出现 `WeChat iLink account configured.`
5. 在微信里给 bridge 发任意一条消息。
6. 再发 `/status` 和 `/help` 验证。

之后后台服务会在登录后自动运行：

- macOS：用户级 LaunchAgent，`com.codex.wechat-bridge`
- Windows：任务计划程序，`CodexWechatBridge`

---

## 常用命令

检测当前环境：

```bash
node <by-my-side-skill-folder>/scripts/by-my-side.mjs detect
```

一键连接：

```bash
node <by-my-side-skill-folder>/scripts/by-my-side.mjs connect --workspace /absolute/path/to/workspace
```

只运行扫码 setup：

```bash
node <by-my-side-skill-folder>/scripts/by-my-side.mjs setup --workspace /absolute/path/to/workspace
```

只安装持久化后台服务：

```bash
node <by-my-side-skill-folder>/scripts/by-my-side.mjs install-service --workspace /absolute/path/to/workspace
```

预览后台服务安装命令：

```bash
node <by-my-side-skill-folder>/scripts/by-my-side.mjs install-service --workspace /absolute/path/to/workspace --dry-run
```

查看 bridge 状态：

```bash
node <by-my-side-skill-folder>/scripts/by-my-side.mjs status --workspace /absolute/path/to/workspace
```

默认会使用 Skill 内置的 bridge。如果你要改用外部 checkout，可以显式传入：

```bash
node <by-my-side-skill-folder>/scripts/by-my-side.mjs connect \
  --bridge-dir /absolute/path/to/codex-wechat-bridge \
  --workspace /absolute/path/to/workspace
```

---

## 数据和隐私

默认运行时数据目录：

```text
~/.codex-wechat-bridge
```

里面可能包含：

- `account.json`
- `context_tokens.json`
- `sync_cursor.json`
- `logs/`
- 微信图片和文件缓存

这些文件不属于 Skill，也不应该提交到仓库。每个使用者都应该用自己的微信账号扫码。

这个 bridge 是单 owner 模式。第一个配置成功的微信 owner，就是唯一可以使用这个 bridge 的微信发送者。

---

## 致谢

By My Side 内置的桥接项目基于 Node.js、TypeScript、Vitest、tsx 等开源方案构建，并遵循 Agent Skills 的 `SKILL.md` 结构。完整说明见 [ACKNOWLEDGEMENTS.md](./ACKNOWLEDGEMENTS.md)。

---

## 限制

- 只支持个人微信 iLink，不支持企业微信。
- 扫码和微信确认必须由用户自己完成。
- Windows 适配的是持久化运行方式，不保证 Codex 桌面端 GUI 表现和 macOS 完全一致。
- 它依赖本地 Codex / Codex App Server，本机 Codex 登录和模型访问需要先可用。
- bridge 会把任务交给本地 Codex 线程执行；只在你能接受本地文件访问边界的机器和工作区里使用。
