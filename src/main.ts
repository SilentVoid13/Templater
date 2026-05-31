import { addIcon, Notice, Plugin } from "obsidian";

import {
    DEFAULT_SETTINGS,
    Settings,
    TemplaterSettingTab,
} from "settings/Settings";
import { FuzzySuggester } from "handlers/FuzzySuggester";
import { ICON_DATA } from "utils/Constants";
import { Templater } from "core/Templater";
import EventHandler from "handlers/EventHandler";
import { CommandHandler } from "handlers/CommandHandler";
import { Editor } from "editor/Editor";

export default class TemplaterPlugin extends Plugin {
    public settings: Settings = { ...DEFAULT_SETTINGS };
    public templater: Templater;
    public event_handler: EventHandler;
    public command_handler: CommandHandler;
    public fuzzy_suggester: FuzzySuggester;
    public editor_handler: Editor;

    async onload(): Promise<void> {
        await this.load_settings();

        this.templater = new Templater(this);
        await this.templater.setup();

        this.editor_handler = new Editor(this);
        await this.editor_handler.setup();

        this.fuzzy_suggester = new FuzzySuggester(this);

        this.event_handler = new EventHandler(this, this.templater);
        await this.event_handler.setup();

        this.command_handler = new CommandHandler(this);
        this.command_handler.setup();

        addIcon("templater-icon", ICON_DATA);
        this.addRibbonIcon("templater-icon", "Templater", () => {
            this.fuzzy_suggester.insert_template();
        }).setAttribute("id", "rb-templater-icon");

        this.addSettingTab(new TemplaterSettingTab(this));

        // Files might not be created yet
        this.app.workspace.onLayoutReady(async () => {
            await this.templater.execute_startup_scripts();
        });
    }

    async onExternalSettingsChange() {
        await this.load_settings();
    }

    onunload(): void {
        // Failsafe in case teardown doesn't happen immediately after template execution
        void this.templater.functions_generator.teardown();
    }

    async save_settings(): Promise<void> {
        await this.saveData(this.settings);
        this.editor_handler.updateEditorIntellisenseSetting(
            this.settings.intellisense_render,
        );
        await this.event_handler.update_syntax_highlighting();
    }

    async load_settings(): Promise<void> {
        const raw = (await this.loadData()) as Partial<Settings> &
            Record<string, unknown>;
        this.settings = Object.assign({}, DEFAULT_SETTINGS, raw);
        await this.migrate_settings(raw);
    }

    private async migrate_settings(
        raw: Record<string, unknown>,
    ): Promise<void> {
        let dirty = false;

        // Migrate the old pair of booleans to the new tri-state enum.
        // enable_folder_templates / enable_file_templates were removed and
        // replaced by trigger_on_file_creation_mode in data.json.
        if (raw["enable_folder_templates"] === true) {
            this.settings.trigger_on_file_creation_mode = "folder";
            dirty = true;
        } else if (raw["enable_file_templates"] === true) {
            this.settings.trigger_on_file_creation_mode = "regex";
            dirty = true;
        }

        // Strip empty placeholder entries written by the old default values.
        const prevFolderLen = this.settings.folder_templates.length;
        this.settings.folder_templates = this.settings.folder_templates.filter(
            (t) => t.folder || t.template,
        );

        const prevFileLen = this.settings.file_templates.length;
        this.settings.file_templates = this.settings.file_templates.filter(
            (t) => t.template !== "",
        );

        const prevPairsLen = this.settings.templates_pairs.length;
        this.settings.templates_pairs = this.settings.templates_pairs.filter(
            ([a, b]) => a || b,
        );

        const prevHotkeysLen = this.settings.enabled_templates_hotkeys.length;
        this.settings.enabled_templates_hotkeys =
            this.settings.enabled_templates_hotkeys.filter((h) => h);

        const prevStartupLen = this.settings.startup_templates.length;
        this.settings.startup_templates = this.settings.startup_templates.filter(
            (t) => t,
        );

        const prevIgnoreLen = this.settings.ignore_folders_on_creation.length;
        this.settings.ignore_folders_on_creation =
            this.settings.ignore_folders_on_creation.filter((f) => f.folder);

        const arraysChanged =
            this.settings.folder_templates.length !== prevFolderLen ||
            this.settings.file_templates.length !== prevFileLen ||
            this.settings.templates_pairs.length !== prevPairsLen ||
            this.settings.enabled_templates_hotkeys.length !==
                prevHotkeysLen ||
            this.settings.startup_templates.length !== prevStartupLen ||
            this.settings.ignore_folders_on_creation.length !== prevIgnoreLen;

        // These three settings were moved from data.json to localStorage
        // intentionally — they are device-local security gates and must NOT be
        // auto-migrated. Notify the user about each one that was previously
        // enabled so they can re-enable them manually in Templater settings.
        const affectedSettings: string[] = [];
        if (raw["trigger_on_file_creation"] === true) {
            affectedSettings.push("'Trigger on file creation'");
        }
        if (raw["enable_system_commands"] === true) {
            affectedSettings.push("'Enable system commands'");
        }
        const hadStartupTemplates =
            Array.isArray(raw["startup_templates"]) &&
            (raw["startup_templates"] as unknown[]).some((t) => t !== "");
        if (hadStartupTemplates) {
            affectedSettings.push("'Enable startup templates'");
        }
        if (affectedSettings.length > 0) {
            new Notice(
                "Templater: The following settings were reset because they " +
                    "are now device-local: " +
                    affectedSettings.join(", ") +
                    ". Re-enable them in Templater settings if you trust this vault.",
                0,
            );
        }

        const legacyKeys = [
            "trigger_on_file_creation",
            "enable_system_commands",
            "enable_folder_templates",
            "enable_file_templates",
        ];
        const hadLegacyKey = legacyKeys.some((k) => k in raw);
        if (hadLegacyKey) {
            for (const k of legacyKeys) {
                delete (this.settings as unknown as Record<string, unknown>)[k];
            }
        }

        if (dirty || hadLegacyKey || arraysChanged) {
            await this.saveData(this.settings);
        }
    }
}
