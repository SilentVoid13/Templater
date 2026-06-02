import { IntellisenseRenderOption } from "./RenderSettings/IntellisenseRenderOption";

/**
 * DO NOT USE. Only keeping around for migration purposes.
 */
export interface SettingsV1 {
    // Legacy keys removed in V2 (moved to localStorage or replaced by trigger_on_file_creation_mode)
    trigger_on_file_creation?: boolean;
    enable_system_commands?: boolean;
    enable_folder_templates?: boolean;
    enable_file_templates?: boolean;
    // Keys shared with V2 — all optional, may be missing in old data
    templates_folder?: string;
    templates_pairs?: Array<[string, string]>;
    trigger_on_file_creation_mode?: "none" | "folder" | "regex";
    auto_jump_to_cursor?: boolean;
    shell_path?: string;
    user_scripts_folder?: string;
    folder_templates?: Array<{ folder: string; template: string }>;
    file_templates?: Array<{ regex: string; template: string }>;
    ignore_folders_on_creation?: Array<{ folder: string }>;
    syntax_highlighting?: boolean;
    syntax_highlighting_mobile?: boolean;
    enabled_templates_hotkeys?: Array<string>;
    startup_templates?: Array<string>;
    command_timeout?: number;
    intellisense_render?: IntellisenseRenderOption;
}

export function isSettingsV1(obj: unknown): obj is SettingsV1 {
    return !!(obj && typeof obj === "object" && !("data_version" in obj));
}
