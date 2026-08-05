import { LocalSettings } from "settings/LocalSettings";
import type TemplaterPlugin from "../src/main";

declare module "obsidian" {
    interface Vault {
        setConfig(key: "showInlineTitle" | "showViewHeader", value: boolean): void;
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
