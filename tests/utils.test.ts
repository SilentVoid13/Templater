import { TFile } from "obsidian";
import TestTemplaterPlugin from "./main.test";

export const PLUGIN_NAME = "templater-obsidian";
export const TEMPLATE_FILE_NAME = "TemplateFile";
export const TARGET_FILE_NAME = "TargetFile";

export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function cache_update(t: TestTemplaterPlugin): Promise<void> {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject("Cache update timeout"), 500);
        const resolve_promise = (file: TFile) => {
            if (file === t.target_file) {
                clearTimeout(timeout);
                t.app.metadataCache.off("changed", resolve_promise);
                resolve();
            }
        };
        t.app.metadataCache.on("changed", resolve_promise);
    });
}

export function properties_are_visible(): boolean {
    return !!document.querySelector(
        ".workspace-leaf.mod-active .metadata-properties .metadata-property"
    );
}
