#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const SECRET_RE = /(api.?key|token|secret|password|license|credential)/i;

function main() {
  const config = JSON.parse(process.env.OPENCLAW_PLUGIN_CONFIG || "{}");
  const argv = parseArgs(process.argv.slice(2));
  const command = argv._[0] || "help";
  try {
    const result = dispatch(config, command, argv);
    if (result !== undefined) ok(config, command, result);
  } catch (error) {
    fail(error);
  }
}

function dispatch(config, command, argv) {
  if (command === "help") return help(config);
  if (command === "status") return status(config, argv);
  if (command === "capabilities") return { capabilities: config.capabilities || [] };
  if (command === "settings") return settings(config, argv);

  switch (config.domain) {
    case "icons":
      return icons(config, command, argv);
    case "file-colors":
      return fileColors(config, command, argv);
    case "tag-colors":
      return tagColors(config, command, argv);
    case "highlight":
      return highlight(config, command, argv);
    case "tasks":
      return tasks(config, command, argv);
    case "tables":
      return tables(config, command, argv);
    case "kanban":
      return kanban(config, command, argv);
    case "templater":
      return templater(config, command, argv);
    case "calendar":
      return calendar(config, command, argv);
    default:
      throw usage(`Unknown command: ${command}`);
  }
}

function help(config) {
  return {
    usage: `${config.bin} <command> --vault <vault> [options]`,
    common: ["status", "capabilities", "settings get|set|validate|export|import"],
    domain: config.commands || [],
  };
}

function status(config, argv) {
  const vault = requireVault(argv);
  const settingsPath = pluginSettingsPath(config, vault);
  return {
    vault,
    pluginId: config.pluginId,
    settingsPath,
    settingsExists: fs.existsSync(settingsPath),
  };
}

function settings(config, argv) {
  const action = argv._[1];
  const vault = requireVault(argv);
  const settingsPath = pluginSettingsPath(config, vault);
  if (action === "validate") {
    const data = readJson(settingsPath, {});
    return { valid: data && typeof data === "object" && !Array.isArray(data) };
  }
  if (action === "get") {
    const data = readJson(settingsPath, {});
    const key = argv.key;
    const value = key ? getPath(data, key) : data;
    return { settings: argv["include-secrets"] ? value : redact(value) };
  }
  if (action === "export") {
    return { settings: argv["include-secrets"] ? readJson(settingsPath, {}) : redact(readJson(settingsPath, {})) };
  }
  if (action === "set") {
    const key = required(argv, "key");
    const raw = required(argv, "value");
    const data = readJson(settingsPath, {});
    setPath(data, key, parseValue(raw));
    return writeJson(settingsPath, data, argv, { key });
  }
  if (action === "import") {
    const file = required(argv, "file");
    const data = readJson(path.resolve(file), {});
    return writeJson(settingsPath, data, argv, { importedFrom: file });
  }
  throw usage("Usage: settings get|set|validate|export|import --vault <vault>");
}

function icons(config, command, argv) {
  const vault = requireVault(argv);
  const file = vaultPath(vault, required(argv, "path"));
  if (command === "list") return { items: listMarkdownFiles(vault).map((p) => ({ path: p, ...readFrontmatter(vaultPath(vault, p)).data })).filter((x) => x.icon || x.iconColor) };
  if (command === "set") {
    const fm = readFrontmatter(file);
    fm.data.icon = required(argv, "icon");
    if (argv.color) fm.data.iconColor = argv.color;
    return writeFrontmatter(file, fm, argv);
  }
  if (command === "remove") {
    const fm = readFrontmatter(file);
    delete fm.data.icon;
    delete fm.data.iconColor;
    return writeFrontmatter(file, fm, argv);
  }
  throw usage("Usage: list|set|remove --vault <vault> --path <note.md> [--icon <name>] [--color <css>]");
}

function fileColors(config, command, argv) {
  const vault = requireVault(argv);
  const settingsPath = pluginSettingsPath(config, vault);
  const data = readJson(settingsPath, { fileColors: [], palette: [] });
  data.fileColors ||= [];
  if (command === "list") return { fileColors: data.fileColors, palette: data.palette || [] };
  const target = required(argv, "path");
  if (command === "set") {
    const color = required(argv, "color");
    data.fileColors = data.fileColors.filter((x) => fileColorPath(x) !== target);
    data.fileColors.push({ path: target, color });
    return writeJson(settingsPath, data, argv, { path: target, color });
  }
  if (command === "remove") {
    data.fileColors = data.fileColors.filter((x) => fileColorPath(x) !== target);
    return writeJson(settingsPath, data, argv, { path: target });
  }
  throw usage("Usage: list|set|remove --vault <vault> --path <file-or-folder> --color <css>");
}

function tagColors(config, command, argv) {
  const vault = requireVault(argv);
  const settingsPath = pluginSettingsPath(config, vault);
  const data = readJson(settingsPath, { tagColors: {}, knownTags: {} });
  data.tagColors ||= {};
  if (command === "list") return { tagColors: data.tagColors, knownTags: data.knownTags || {} };
  const tag = normalizeTag(required(argv, "tag"));
  if (command === "set") {
    data.tagColors[tag] = required(argv, "color");
    return writeJson(settingsPath, data, argv, { tag, color: data.tagColors[tag] });
  }
  if (command === "remove") {
    delete data.tagColors[tag];
    return writeJson(settingsPath, data, argv, { tag });
  }
  throw usage("Usage: list|set|remove --vault <vault> --tag <tag> --color <css>");
}

function highlight(config, command, argv) {
  const vault = requireVault(argv);
  if (command === "palette") return { colors: Object.keys(readJson(pluginSettingsPath(config, vault), {}).highlightr || {}) };
  const rel = required(argv, "path");
  const file = vaultPath(vault, rel);
  const text = fs.readFileSync(file, "utf8");
  if (command === "remove") {
    const next = text.replace(/<mark(?: [^>]*)?>(.*?)<\/mark>/gs, "$1");
    return writeText(file, next, argv, { path: rel });
  }
  if (command === "apply") {
    const needle = required(argv, "text");
    const color = argv.color || "yellow";
    const idx = text.indexOf(needle);
    if (idx < 0) throw usage(`Text not found in ${rel}`);
    const next = text.slice(0, idx) + `<mark style="background: ${escapeAttr(color)};">${needle}</mark>` + text.slice(idx + needle.length);
    return writeText(file, next, argv, { path: rel, color });
  }
  throw usage("Usage: apply|remove|palette --vault <vault> --path <note.md> --text <text> [--color <css>]");
}

function tasks(config, command, argv) {
  const vault = requireVault(argv);
  if (command === "list") {
    return { tasks: listMarkdownFiles(vault).flatMap((rel) => readLines(vaultPath(vault, rel)).map((line, index) => ({ rel, line, index })).filter((x) => /^\s*[-*]\s+\[[ xX]\]\s+/.test(x.line))) };
  }
  const rel = required(argv, "path");
  const file = vaultPath(vault, rel);
  const lines = readLines(file);
  if (command === "create") {
    lines.push(`- [ ] ${required(argv, "text")}`);
    return writeText(file, lines.join("\n") + "\n", argv, { path: rel });
  }
  const lineNo = Number(required(argv, "line"));
  if (!Number.isInteger(lineNo) || lineNo < 1 || lineNo > lines.length) throw usage("Invalid --line");
  if (command === "toggle" || command === "complete") {
    lines[lineNo - 1] = lines[lineNo - 1].replace(/\[ \]|\[[xX]\]/, command === "complete" ? "[x]" : (/\[ \]/.test(lines[lineNo - 1]) ? "[x]" : "[ ]"));
    return writeText(file, lines.join("\n") + "\n", argv, { path: rel, line: lineNo });
  }
  throw usage("Usage: list|create|toggle|complete --vault <vault> [--path <note.md>] [--line <n>] [--text <task>]");
}

function tables(config, command, argv) {
  const vault = requireVault(argv);
  const rel = required(argv, "path");
  const file = vaultPath(vault, rel);
  if (command === "list") return { tables: findTables(fs.readFileSync(file, "utf8")) };
  if (command === "format") return writeText(file, formatTables(fs.readFileSync(file, "utf8")), argv, { path: rel });
  throw usage("Usage: list|format --vault <vault> --path <note.md>");
}

function kanban(config, command, argv) {
  const vault = requireVault(argv);
  if (command === "list") return { boards: listMarkdownFiles(vault).filter((rel) => /kanban-plugin:/.test(fs.readFileSync(vaultPath(vault, rel), "utf8"))) };
  const rel = required(argv, "path");
  const file = vaultPath(vault, rel);
  const text = fs.readFileSync(file, "utf8");
  if (command === "cards") return { cards: text.split(/\r?\n/).map((line, index) => ({ line: index + 1, text: line })).filter((x) => /^\s*-\s+\[[ xX]\]\s+/.test(x.text) || /^\s*-\s+/.test(x.text)) };
  if (command === "add-card") {
    const lane = required(argv, "lane");
    const card = required(argv, "text");
    const next = insertUnderHeading(text, lane, `- [ ] ${card}`);
    return writeText(file, next, argv, { path: rel, lane });
  }
  throw usage("Usage: list|cards|add-card --vault <vault> --path <board.md> [--lane <heading>] [--text <card>]");
}

function templater(config, command, argv) {
  const vault = requireVault(argv);
  if (command !== "render") throw usage("Usage: render --vault <vault> --template <path> --output <path> [--var k=v]");
  const template = fs.readFileSync(vaultPath(vault, required(argv, "template")), "utf8");
  const vars = asArray(argv.var).reduce((acc, entry) => {
    const [key, ...rest] = String(entry).split("=");
    acc[key] = rest.join("=");
    return acc;
  }, {});
  const rendered = template.replace(/<%[-_]?([\s\S]*?)[-_]?%>/g, "").replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, key) => vars[key] ?? "");
  return writeText(vaultPath(vault, required(argv, "output")), rendered, argv, { output: argv.output });
}

function calendar(config, command, argv) {
  const vault = requireVault(argv);
  const data = readJson(pluginSettingsPath(config, vault), {});
  if (command === "daily") {
    const date = argv.date || new Date().toISOString().slice(0, 10);
    const rel = `${data.dailyNoteFolder || ""}/${date}.md`.replace(/^\/+/, "");
    ensureParent(vaultPath(vault, rel));
    if (!fs.existsSync(vaultPath(vault, rel))) return writeText(vaultPath(vault, rel), `# ${date}\n`, argv, { path: rel });
    return { path: rel, exists: true };
  }
  if (command === "weekly") {
    const date = argv.date || new Date().toISOString().slice(0, 10);
    const rel = `${data.weeklyNoteFolder || ""}/${formatWeekly(data.weeklyNoteFormat || "gggg-[W]ww", date)}.md`.replace(/^\/+/, "");
    ensureParent(vaultPath(vault, rel));
    if (!fs.existsSync(vaultPath(vault, rel))) return writeText(vaultPath(vault, rel), `# ${path.basename(rel, ".md")}\n`, argv, { path: rel });
    return { path: rel, exists: true };
  }
  throw usage("Usage: daily|weekly --vault <vault> [--date YYYY-MM-DD]");
}

function parseArgs(args) {
  const out = { _: [] };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith("--")) out._.push(arg);
    else {
      const key = arg.slice(2);
      const value = args[i + 1] && !args[i + 1].startsWith("--") ? args[++i] : true;
      if (out[key] === undefined) out[key] = value;
      else out[key] = asArray(out[key]).concat(value);
    }
  }
  return out;
}

function requireVault(argv) {
  const vault = path.resolve(required(argv, "vault"));
  if (!fs.existsSync(vault)) throw usage(`Vault does not exist: ${vault}`);
  return vault;
}

function required(argv, key) {
  if (argv[key] === undefined || argv[key] === "") throw usage(`Missing --${key}`);
  return String(argv[key]);
}

function pluginSettingsPath(config, vault) {
  return path.join(vault, ".obsidian", "plugins", config.installedId || config.pluginId, "data.json");
}

function vaultPath(vault, rel) {
  if (path.isAbsolute(rel) || rel.split(/[\\/]+/).includes("..")) throw usage("Vault-relative paths must not be absolute or contain ..");
  return path.join(vault, rel);
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data, argv, extra = {}) {
  if (argv["dry-run"]) return { dryRun: true, actions: [{ write: file }], ...extra };
  ensureParent(file);
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`);
  fs.renameSync(tmp, file);
  return { written: file, ...extra };
}

function writeText(file, text, argv, extra = {}) {
  if (argv["dry-run"]) return { dryRun: true, actions: [{ write: file }], ...extra };
  ensureParent(file);
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, file);
  return { written: file, ...extra };
}

function ensureParent(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

function ok(config, command, data) {
  process.stdout.write(`${JSON.stringify({ ok: true, pluginId: config.pluginId, command, ...data }, null, 2)}\n`);
}

function fail(error) {
  process.stdout.write(`${JSON.stringify({ ok: false, error: { code: error.code || "unexpected_error", message: error.message } }, null, 2)}\n`);
  process.exitCode = error.code === "usage" ? 2 : 1;
}

function usage(message) {
  const error = new Error(message);
  error.code = "usage";
  return error;
}

function redact(value) {
  if (Array.isArray(value)) return value.map(redact);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, SECRET_RE.test(k) ? "[REDACTED]" : redact(v)]));
}

function getPath(obj, key) {
  return key.split(".").reduce((acc, part) => acc == null ? undefined : acc[part], obj);
}

function setPath(obj, key, value) {
  const parts = key.split(".");
  let cur = obj;
  while (parts.length > 1) {
    const part = parts.shift();
    cur[part] ||= {};
    cur = cur[part];
  }
  cur[parts[0]] = value;
}

function parseValue(raw) {
  try { return JSON.parse(raw); } catch { return raw; }
}

function asArray(value) {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeTag(tag) {
  return tag.replace(/^#/, "");
}

function listMarkdownFiles(vault) {
  const result = cp.execFileSync("find", [vault, "-type", "f", "-name", "*.md"], { encoding: "utf8" }).trim();
  return result ? result.split("\n").map((p) => path.relative(vault, p)) : [];
}

function readLines(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8").split(/\r?\n/) : [];
}

function readFrontmatter(file) {
  const text = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const data = {};
  if (match) {
    for (const line of match[1].split(/\r?\n/)) {
      const m = line.match(/^([^:#][^:]*):\s*(.*)$/);
      if (m) data[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
    return { data, body: text.slice(match[0].length), hadFrontmatter: true };
  }
  return { data, body: text, hadFrontmatter: false };
}

function writeFrontmatter(file, fm, argv) {
  const yaml = Object.entries(fm.data).map(([k, v]) => `${k}: ${JSON.stringify(String(v))}`).join("\n");
  return writeText(file, `---\n${yaml}\n---\n${fm.body}`, argv, { path: path.basename(file) });
}

function escapeAttr(value) {
  return String(value).replace(/[&"]/g, (c) => c === "&" ? "&amp;" : "&quot;");
}

function fileColorPath(item) {
  return item.path || item.file || item.folder || item[0];
}

function findTables(text) {
  const lines = text.split(/\r?\n/);
  const tables = [];
  for (let i = 0; i < lines.length - 1; i++) {
    if (lines[i].includes("|") && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[i + 1])) {
      tables.push({ startLine: i + 1 });
    }
  }
  return tables;
}

function formatTables(text) {
  const lines = text.split(/\r?\n/);
  return lines.map((line) => line.includes("|") ? line.split("|").map((cell) => cell.trim()).join(" | ") : line).join("\n");
}

function insertUnderHeading(text, heading, line) {
  const lines = text.split(/\r?\n/);
  const idx = lines.findIndex((l) => l.replace(/^#+\s*/, "").trim() === heading);
  if (idx < 0) return `${text.replace(/\s*$/, "\n")}\n## ${heading}\n${line}\n`;
  lines.splice(idx + 1, 0, line);
  return lines.join("\n");
}

function formatWeekly(format, date) {
  const d = new Date(`${date}T00:00:00Z`);
  const onejan = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d - onejan) / 86400000) + onejan.getUTCDay() + 1) / 7);
  return format.replace(/gggg|YYYY/g, String(d.getUTCFullYear())).replace(/\[W\]/g, "W").replace(/ww/g, String(week).padStart(2, "0"));
}

main();
