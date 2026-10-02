import type { TFile, TFolder } from "obsidian";
import { LocalSettings } from "settings/LocalSettings";
import type TemplaterPlugin from "../src/main";

declare module "obsidian" {
    interface Vault {
        setConfig(key: "showInlineTitle" | "showViewHeader", value: boolean): void;
    }

    interface FileManager {
        /** Used by the "New canvas" and "New base" menu items */
        createNewFile(
            parent?: TFolder,
            name?: string,
            extension?: string,
            contents?: string,
        ): Promise<TFile>;
    }

    interface App {
        plugins: {
            getPlugin(id: "templater-obsidian"): TemplaterPlugin | null;
        };
        loadLocalStorage(
            key: "templater-local-settings",
        ): Partial<LocalSettings> | undefined;
        commands: {
            commands: Record<string, unknown>;
        };
    }
}

declare module "wdio-obsidian-service" {
    interface InstalledPlugins {
        templaterObsidian: TemplaterPlugin;
        "templater-obsidian": TemplaterPlugin;
    }
}
