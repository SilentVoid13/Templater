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
import { errorWrapper } from "utils/Error";
import { resolve_tfile } from "utils/Utils";

export default class TemplaterPlugin extends Plugin {
    public settings: Settings;
    public templater: Templater;
    public event_handler: EventHandler;
    public command_handler: CommandHandler;
    public fuzzy_suggester: FuzzySuggester;
    public editor_handler: Editor;
    private ribbon_template_icons: HTMLElement[] = [];

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
            this.settings
        );
        this.event_handler.setup();

        this.command_handler = new CommandHandler(this);
        this.command_handler.setup();

        addIcon("templater-icon", ICON_DATA);
        this.addRibbonIcon("templater-icon", "Templater", async () => {
            this.fuzzy_suggester.insert_template();
        }).setAttribute("id", "rb-templater-icon");

        this.setup_ribbon_templates();

        this.addSettingTab(new TemplaterSettingTab(this));

        // Files might not be created yet
        this.app.workspace.onLayoutReady(() => {
            this.templater.execute_startup_scripts();
        });
    }

    async onExternalSettingsChange() {
        await this.load_settings();
    }

    onunload(): void {
        // Failsafe in case teardown doesn't happen immediately after template execution
        this.templater.functions_generator.teardown();
    }

    async save_settings(): Promise<void> {
        await this.saveData(this.settings);
        this.editor_handler.updateEditorIntellisenseSetting(this.settings.intellisense_render);
    }

    async load_settings(): Promise<void> {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData()
        );
    }

    setup_ribbon_templates(): void {
        for (const ribbon_template of this.settings.ribbon_templates) {
            if (!ribbon_template.templatePath || !ribbon_template.icon) {
                continue;
            }

            const icon = this.addRibbonIcon(
                ribbon_template.icon,
                ribbon_template.name || ribbon_template.templatePath,
                async () => {
                    await errorWrapper(async () => {
                        const template_file = resolve_tfile(
                            this.app,
                            ribbon_template.templatePath
                        );
                        if (ribbon_template.action === "create") {
                            await this.templater.create_new_note_from_template(
                                template_file
                            );
                        } else {
                            await this.templater.append_template_to_active_file(
                                template_file
                            );
                        }
                    }, `Failed to execute ribbon template: ${ribbon_template.name}`);
                }
            );
            this.ribbon_template_icons.push(icon);
        }
    }

    refresh_ribbon_templates(): void {
        // Remove existing ribbon template icons
        for (const icon of this.ribbon_template_icons) {
            icon.remove();
        }
        this.ribbon_template_icons = [];

        // Re-add ribbon template icons
        this.setup_ribbon_templates();
    }
}
