import { DEFAULT_SETTINGS, type Settings } from "./Settings";
import { IntellisenseRenderOption } from "./RenderSettings/IntellisenseRenderOption";
import { isSettingsV1, type SettingsV1 } from "./SettingsV1";

export interface MigrationResult {
    settings: Settings;
    affectedSecuritySettings: string[];
    wasMigrated: boolean;
}

/**
 * Handles backwards-incompatible changes to the settings schema.
 * @param raw The raw value from loadData().
 * @returns The settings with any migrations applied, plus metadata for the caller.
 */
export function migrateSettings(raw: unknown): MigrationResult {
    if (isSettingsV1(raw)) {
        return migrateV1ToV2(raw);
    }
    return {
        settings: Object.assign({}, DEFAULT_SETTINGS, raw as Partial<Settings>),
        affectedSecuritySettings: [],
        wasMigrated: false,
    };
}

function migrateV1ToV2(v1: SettingsV1): MigrationResult {
    const affectedSecuritySettings: string[] = [];

    if (v1.trigger_on_file_creation === true)
        affectedSecuritySettings.push("'Trigger on file creation'");
    if (v1.enable_system_commands === true)
        affectedSecuritySettings.push("'Enable system commands'");
    if (
        Array.isArray(v1.startup_templates) &&
        v1.startup_templates.some((t) => t !== "")
    )
        affectedSecuritySettings.push("'Enable startup templates'");

    const trigger_on_file_creation_mode: Settings["trigger_on_file_creation_mode"] =
        v1.enable_folder_templates === true
            ? "folder"
            : v1.enable_file_templates === true
              ? "regex"
              : (v1.trigger_on_file_creation_mode ?? "none");

    const settings: Settings = Object.assign({}, DEFAULT_SETTINGS, v1, {
        data_version: 2,
        trigger_on_file_creation_mode,
        folder_templates: (v1.folder_templates ?? []).filter(
            (t) => t.folder || t.template,
        ),
        file_templates: (v1.file_templates ?? []).filter(
            (t) => t.template !== "",
        ),
        templates_pairs: (v1.templates_pairs ?? []).filter(([a, b]) => a || b),
        enabled_templates_hotkeys: (v1.enabled_templates_hotkeys ?? []).filter(
            (h) => h,
        ),
        startup_templates: (v1.startup_templates ?? []).filter((t) => t),
        ignore_folders_on_creation: (
            v1.ignore_folders_on_creation ?? []
        ).filter((f) => f.folder),
    });

    if (typeof (v1.intellisense_render as unknown) === "number") {
        settings.intellisense_render = String(
            v1.intellisense_render,
        ) as IntellisenseRenderOption;
    }

    for (const k of [
        "trigger_on_file_creation",
        "enable_system_commands",
        "enable_folder_templates",
        "enable_file_templates",
    ]) {
        delete (settings as unknown as Record<string, unknown>)[k];
    }

    return { settings, affectedSecuritySettings, wasMigrated: true };
}
