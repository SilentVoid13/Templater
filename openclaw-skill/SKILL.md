---
name: templater-obsidian-cli
description: Use this skill when an OpenClaw agent needs to render a simple Obsidian Templater-style template into a target note without opening Obsidian.
---

# Templater CLI

Use this repo's CLI for simple headless template rendering. Always pass `--vault <vault>`.

```bash
PLUGIN_REPO=/path/to/Templater
npm --prefix "$PLUGIN_REPO" run cli-build
node "$PLUGIN_REPO/openclaw-templater-cli.cjs" render --vault <vault> --template "Templates/Note.md" --output "Notes/New.md" --var title=New
```

The CLI replaces `{{ key }}` placeholders from `--var key=value` and strips Templater execution blocks.

If installed or linked, `templater-obsidian-cli ...` may be used instead.

## Safety

- Use this for simple placeholders, not arbitrary Templater JavaScript execution.
- Prefer `--dry-run` before writing an output file.
- Treat `ok: false` or nonzero exit as failure and report `error.message`.

