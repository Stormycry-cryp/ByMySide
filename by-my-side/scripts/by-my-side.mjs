#!/usr/bin/env node
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const command = process.argv[2] ?? "help";
const options = parseOptions(process.argv.slice(3));
const skillDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const defaultBridgeDir = resolve(skillDir, "vendor", "codex-wechat-bridge");

if (command === "help" || command === "--help" || command === "-h") {
  printHelp();
  process.exit(0);
}

const bridgeDir = resolve(options.bridgeDir ?? defaultBridgeDir);
const workspace = resolve(options.workspace ?? process.cwd());

if (command === "detect") {
  console.log(JSON.stringify({
    skillDir,
    bridgeDir,
    bridgeSource: options.bridgeDir ? "external" : "bundled",
    bridgeExists: existsSync(resolve(bridgeDir, "package.json")),
    dataDir: options.dataDir ?? resolve(homedir(), ".codex-wechat-bridge")
  }, null, 2));
  process.exit(0);
}

await ensureBridge();

if (command === "status") {
  await prepareBridge();
  run("node", ["dist/cli.js", "status", "--cwd", workspace, ...dataDirArgs()], { cwd: bridgeDir });
} else if (command === "setup") {
  await prepareBridge();
  printScanGuide();
  run("node", ["dist/cli.js", "setup", "--cwd", workspace, ...dataDirArgs()], { cwd: bridgeDir });
} else if (command === "install-service") {
  await prepareBridge();
  run("node", ["scripts/service.mjs", "install", "--cwd", workspace, ...dataDirArgs(), ...dryRunArgs()], { cwd: bridgeDir });
} else if (command === "connect") {
  await prepareBridge();
  const status = readStatus();
  if (!status.hasWechatToken) {
    printScanGuide();
    run("node", ["dist/cli.js", "setup", "--cwd", workspace, ...dataDirArgs()], { cwd: bridgeDir });
  } else {
    console.log("Existing WeChat token detected; skipping QR setup.");
  }
  run("node", ["scripts/service.mjs", "install", "--cwd", workspace, ...dataDirArgs(), ...dryRunArgs()], { cwd: bridgeDir });
  console.log("");
  console.log("Verification:");
  console.log("1. Send any message to the bridge from WeChat if this is the first run.");
  console.log("2. Send /status and /help in WeChat.");
  run("node", ["dist/cli.js", "status", "--cwd", workspace, ...dataDirArgs()], { cwd: bridgeDir });
} else {
  throw new Error(`Unknown command: ${command}`);
}

async function ensureBridge() {
  if (existsSync(resolve(bridgeDir, "package.json"))) return;
  throw new Error(`Missing bundled bridge project: ${bridgeDir}`);
}

async function prepareBridge() {
  if (!existsSync(resolve(bridgeDir, "node_modules"))) {
    run("npm", ["install"], { cwd: bridgeDir });
  }
  run("npm", ["run", "build"], { cwd: bridgeDir });
}

function readStatus() {
  const result = spawnSync("node", ["dist/cli.js", "status", "--cwd", workspace, ...dataDirArgs()], {
    cwd: bridgeDir,
    encoding: "utf8"
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "failed to read bridge status");
  }
  return JSON.parse(result.stdout);
}

function run(bin, args, opts = {}) {
  console.log(formatCommand([bin, ...args]));
  if (options.dryRun && bin !== "node") return;
  const result = spawnSync(bin, args, { stdio: "inherit", ...opts });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${formatCommand([bin, ...args])}`);
  }
}

function dataDirArgs() {
  return options.dataDir ? ["--data-dir", resolve(options.dataDir)] : [];
}

function dryRunArgs() {
  return options.dryRun ? ["--dry-run"] : [];
}

function parseOptions(argv) {
  const parsed = { dryRun: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (arg === "--dry-run") {
      parsed.dryRun = true;
    } else if ((arg === "--workspace" || arg === "--cwd" || arg === "-C") && next) {
      parsed.workspace = next;
      index += 1;
    } else if (arg === "--bridge-dir" && next) {
      parsed.bridgeDir = next;
      index += 1;
    } else if (arg === "--data-dir" && next) {
      parsed.dataDir = next;
      index += 1;
    }
  }
  return parsed;
}

function printScanGuide() {
  console.log("");
  console.log("Scan guide:");
  console.log("1. Keep this terminal running.");
  console.log("2. Scan the printed QR code or open the printed QR URL with WeChat.");
  console.log("3. Confirm login in WeChat.");
  console.log("4. Wait for `WeChat iLink account configured.`");
  console.log("");
}

function formatCommand(commandLine) {
  return commandLine.map((part) => /[\s"]/u.test(part) ? `'${part.replaceAll("'", "'\\''")}'` : part).join(" ");
}

function printHelp() {
  console.log(`by-my-side

Usage:
  node scripts/by-my-side.mjs connect --workspace <path>
  node scripts/by-my-side.mjs detect
  node scripts/by-my-side.mjs status --workspace <path>
  node scripts/by-my-side.mjs setup --workspace <path>
  node scripts/by-my-side.mjs install-service --workspace <path> [--dry-run]

Options:
  --bridge-dir <path>  Optional external codex-wechat-bridge checkout
  --data-dir <path>    Bridge runtime data directory
  --dry-run            Preview service installation command
`);
}
