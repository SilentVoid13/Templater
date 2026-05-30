import { App } from "obsidian";

export interface LocalSettings {
    trigger_on_file_creation: boolean;
    enable_startup_templates: boolean;
    enable_system_commands: boolean;
}

export const DEFAULT_LOCAL_SETTINGS: LocalSettings = {
    trigger_on_file_creation: false,
    enable_startup_templates: false,
    enable_system_commands: false,
};

const LOCAL_STORAGE_KEY = "templater-local-settings";

export function getLocalSettings(app: App): LocalSettings {
    const stored = app.loadLocalStorage(
        LOCAL_STORAGE_KEY,
    ) as Partial<LocalSettings> | null;
    return Object.assign({}, DEFAULT_LOCAL_SETTINGS, stored ?? {});
}

export function saveLocalSetting<K extends keyof LocalSettings>(
    app: App,
    key: K,
    value: LocalSettings[K],
): void {
    const current =
        (app.loadLocalStorage(
            LOCAL_STORAGE_KEY,
        ) as Partial<LocalSettings> | null) ?? {};
    app.saveLocalStorage(LOCAL_STORAGE_KEY, { ...current, [key]: value });
}
