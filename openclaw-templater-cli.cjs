#!/usr/bin/env node
"use strict";

process.env.OPENCLAW_PLUGIN_CONFIG = JSON.stringify({
  pluginId: "templater-obsidian",
  installedId: "templater-obsidian",
  bin: "templater-obsidian-cli",
  domain: "templater",
  capabilities: ["settings", "simple-template-render"],
  commands: ["render"],
});
require("./openclaw-plugin-cli.cjs");
