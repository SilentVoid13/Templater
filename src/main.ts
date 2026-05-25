import { addIcon, Plugin } from "obsidian";

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

        this.event_handler = new EventHandler(
            this,
            this.templater,
            this.settings,
        );
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
        this.event_handler.update_trigger_file_on_creation();
    }

    async load_settings(): Promise<void> {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            (await this.loadData()) as Partial<Settings>,
        );
    }
}
