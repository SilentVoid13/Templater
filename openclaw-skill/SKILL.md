---
name: templater-obsidian-cli
description: Use this skill when an OpenClaw agent needs to render a simple Obsidian Templater-style template into a target note without opening Obsidian.
---

# Templater CLI

Use the CLI shipped in the installed plugin folder. Always pass `--vault <vault>`.

```bash
VAULT=/path/to/vault
CLI="$VAULT/.obsidian/plugins/templater-obsidian/openclaw-templater-cli.cjs"
node "$CLI" render --vault "$VAULT" --template "Templates/Note.md" --output "Notes/New.md" --var title=New
```

The CLI replaces `{{ key }}` placeholders from `--var key=value` and strips Templater execution blocks.

If the installed plugin does not include the CLI yet, use `templater-obsidian-cli` from `PATH` or `node "$PLUGIN_REPO/openclaw-templater-cli.cjs"` from a checkout.

## Safety

- Use this for simple placeholders, not arbitrary Templater JavaScript execution.
- Prefer `--dry-run` before writing an output file.
- Treat `ok: false` or nonzero exit as failure and report `error.message`.

