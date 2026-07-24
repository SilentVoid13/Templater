import { defineConfig, globalIgnores } from "eslint/config";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import obsidianmd from "eslint-plugin-obsidianmd";
import { configs as wdioConfigs } from "eslint-plugin-wdio";

// Pull obsidianmd's own no-restricted-disable config and drop "no-eval" so we
// don't have to maintain a hard-coded copy of the list. The first element is
// the severity ("error"); the rest are the restricted rule names.
const restrictedDisableRule = "eslint-comments/no-restricted-disable";
const baseRestrictedDisable =
    obsidianmd.configs.recommended
        .map((c) => c.rules?.[restrictedDisableRule])
        .filter(Boolean)
        .at(-1) ?? ["error"];

const obsidianGlobals = {
    activeWindow: "readonly",
    activeDocument: "readonly",
    createEl: "readonly",
    createDiv: "readonly",
    createSpan: "readonly",
    createSvg: "readonly",
    createFragment: "readonly",
};

export default defineConfig([
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...obsidianGlobals,
                ...globals.mocha,
                Webdriverio: "readonly",
            },
            parserOptions: {
                projectService: {
                    allowDefaultProject: ["eslint.config.mjs", "manifest.json"],
                },
                tsconfigRootDir: import.meta.dirname,
                extraFileExtensions: [".json"],
            },
        },
    },
    ...obsidianmd.configs.recommended,
    {
        rules: {
            // Reuse obsidianmd's restricted-disable list, but allow inline
            // disabling of no-eval (required to run user scripts from the vault).
            [restrictedDisableRule]: baseRestrictedDisable.filter(
                (rule) => rule !== "no-eval"
            ),
        },
    },
    {
        files: ["test/**/*.ts"],
        rules: {
            "no-restricted-imports": "off",
        },
    },
    wdioConfigs["flat/recommended"],
    globalIgnores([
        "node_modules",
        "dist",
        "esbuild.config.mjs",
        "version-bump.mjs",
        "versions.json",
        "main.js",
        "src/editor/mode/javascript.js",
    ]),
]);
