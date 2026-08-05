/**
 * A template hotkey with per-command configuration. Omitted flags default to
 * `true`, so `{ template: "x.md" }` is equivalent to the plain string `"x.md"`.
 */
export interface TemplateHotkey {
    template: string;
    insert_enabled?: boolean;
    create_enabled?: boolean;
}

/**
 * A stored `enabled_templates_hotkeys` entry. A plain string enables both the
 * insert and the create command, which is the format Templater used before
 * per-command configuration existed.
 */
export type TemplateHotkeyEntry = string | TemplateHotkey;

export interface ResolvedTemplateHotkey {
    template: string;
    insert_enabled: boolean;
    create_enabled: boolean;
}

/**
 * Normalizes a stored entry into explicit flags. Tolerates malformed entries
 * (hand-edited or synced `data.json`) by returning an empty template path,
 * which callers skip.
 */
export function resolve_template_hotkey(
    entry: TemplateHotkeyEntry | null | undefined,
): ResolvedTemplateHotkey {
    if (typeof entry === "string") {
        return {
            template: entry,
            insert_enabled: true,
            create_enabled: true,
        };
    }
    return {
        template: typeof entry?.template === "string" ? entry.template : "",
        insert_enabled: entry?.insert_enabled ?? true,
        create_enabled: entry?.create_enabled ?? true,
    };
}

/**
 * Converts a resolved hotkey back to its canonical stored form. Entries with
 * both commands enabled are stored as a plain string, so `data.json` only gains
 * objects for templates that actually disable a command.
 */
export function serialize_template_hotkey(
    hotkey: ResolvedTemplateHotkey,
): TemplateHotkeyEntry {
    if (hotkey.insert_enabled && hotkey.create_enabled) {
        return hotkey.template;
    }
    return {
        template: hotkey.template,
        insert_enabled: hotkey.insert_enabled,
        create_enabled: hotkey.create_enabled,
    };
}

/**
 * Human readable summary of the commands a hotkey registers.
 */
export function describe_template_hotkey_commands(
    hotkey: ResolvedTemplateHotkey,
): string {
    const commands: string[] = [];
    if (hotkey.insert_enabled) commands.push("Insert");
    if (hotkey.create_enabled) commands.push("Create");
    return commands.length > 0 ? commands.join(", ") : "None";
}
