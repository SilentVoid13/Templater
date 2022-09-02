import { addIcon, MarkdownView, Plugin } from 'obsidian';

import { DEFAULT_SETTINGS, Settings, TemplaterSettingTab } from "settings/Settings";
import { FuzzySuggester } from "handlers/FuzzySuggester";
import { ICON_DATA } from "utils/Constants";
import { Templater } from "core/Templater";
import EventHandler from "handlers/EventHandler";
import { CommandHandler } from "handlers/CommandHandler";
import { Editor } from "editor/Editor";

import { default as wasmbin } from "../../pkg/templater_wasm_bg.wasm";
import * as wasm from "../../pkg/templater_wasm";

export default class TemplaterPlugin extends Plugin {
    public settings: Settings;
    public templater: Templater;
    public event_handler: EventHandler;
    public command_handler: CommandHandler;
    public fuzzy_suggester: FuzzySuggester;
    public editor_handler: Editor;

    async onload(): Promise<void> {
        console.log(MarkdownView);
        console.log(this.app.workspace.getActiveViewOfType);
        console.log(typeof MarkdownView);

        await this.load_settings();

        this.templater = new Templater(this.app, this);
        await this.templater.setup();

        this.editor_handler = new Editor(this.app, this);
        await this.editor_handler.setup();

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
        if(this.settings.enable_ribbon_icon) {
            this.addRibbonIcon("templater-icon", "Templater", async () => {
                this.fuzzy_suggester.insert_template();
            }).setAttribute("id", "rb-templater-icon");
        }

        this.addSettingTab(new TemplaterSettingTab(this.app, this));


        // Files might not be created yet
        this.app.workspace.onLayoutReady(async () => {
            this.templater.execute_startup_scripts();

            await wasm.default(wasmbin);
            const tp_wasm = await wasm.init_templater(this);
            tp_wasm.append_template_to_active_file(this.app.workspace.getActiveFile());
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
