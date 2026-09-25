import { defineConfig, globalIgnores } from "eslint/config";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import obsidianmd from "eslint-plugin-obsidianmd";
import { configs as wdioConfigs } from "eslint-plugin-wdio";

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
