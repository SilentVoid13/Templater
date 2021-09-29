import { addIcon, Plugin } from "obsidian";

import { DEFAULT_SETTINGS, Settings, TemplaterSettingTab } from "Settings";
import { FuzzySuggester } from "FuzzySuggester";
import { ICON_DATA } from "Constants";
import { Templater } from "Templater";
import EventHandler from "EventHandler";
import { CommandHandler } from "CommandHandler";

export default class TemplaterPlugin extends Plugin {
    public settings: Settings;
    public templater: Templater;
    public event_handler: EventHandler;
    public command_handler: CommandHandler;
    public fuzzy_suggester: FuzzySuggester;

    async onload(): Promise<void> {
        await this.load_settings();

        this.templater = new Templater(this.app, this);
        await this.templater.setup();

        this.fuzzy_suggester = new FuzzySuggester(this.app, this);

        this.event_handler = new EventHandler(
            this.app,
            this,
            this.templater,
            this.settings
        );
        this.event_handler.setup();

        this.command_handler = new CommandHandler(this.app, this);
        this.command_handler.setup();

        addIcon("templater-icon", ICON_DATA);
        this.addRibbonIcon("templater-icon", "Templater", async () => {
            this.fuzzy_suggester.insert_template();
        });

        this.addSettingTab(new TemplaterSettingTab(this.app, this));

        // Files might not be created yet
        this.app.workspace.onLayoutReady(() => {
            this.templater.execute_startup_scripts();
        });
    }

    async save_settings(): Promise<void> {
        await this.saveData(this.settings);
    }

    async load_settings(): Promise<void> {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData()
        );
    }
}
