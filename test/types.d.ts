import type TemplaterPlugin from "../src/main";

declare module "obsidian" {
    interface App {
        plugins: {
            getPlugin(id: "templater-obsidian"): TemplaterPlugin | null;
        };
    }
}

declare module "wdio-obsidian-service" {
    interface InstalledPlugins {
        templaterObsidian: TemplaterPlugin;
        "templater-obsidian": TemplaterPlugin;
    }
}
