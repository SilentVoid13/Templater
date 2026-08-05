import { App, Modal, Setting } from "obsidian";
import TemplaterPlugin from "main";
import {
    FileSuggest,
    FileSuggestMode,
} from "settings/suggesters/FileSuggester";
import type { ResolvedTemplateHotkey } from "settings/TemplateHotkeys";

export class TemplateHotkeyModal extends Modal {
    private template: string;
    private insert_enabled: boolean;
    private create_enabled: boolean;

    constructor(
        app: App,
        private plugin: TemplaterPlugin,
        initialValues: ResolvedTemplateHotkey,
        private onSubmit: (
            hotkey: ResolvedTemplateHotkey,
        ) => Promise<void> | void,
        private validateTemplate: (template: string) => string | undefined,
    ) {
        super(app);
        this.template = initialValues.template;
        this.insert_enabled = initialValues.insert_enabled;
        this.create_enabled = initialValues.create_enabled;
    }

    onOpen() {
        this.setTitle("Template hotkey");
        this.modalEl.addClass("templater-template-hotkey-modal");
        const { contentEl } = this;

        const templateSetting = new Setting(contentEl)
            .setName("Template")
            .setDesc("Enter a template path, e.g. meta/templates/daily.md")
            .addText((cb) => {
                new FileSuggest(
                    cb.inputEl,
                    this.plugin,
                    FileSuggestMode.TemplateFiles,
                );
                cb.setPlaceholder("Template")
                    .setValue(this.template)
                    .onChange((value) => {
                        this.template = value;
                    });
            });

        const insertSetting = new Setting(contentEl)
            .setName("Insert command")
            .setDesc(
                "Adds a command that inserts this template into the active file.",
            )
            .addToggle((cb) => {
                cb.setValue(this.insert_enabled).onChange((value) => {
                    this.insert_enabled = value;
                });
            });

        new Setting(contentEl)
            .setName("Create command")
            .setDesc(
                "Adds a command that creates a new note from this template.",
            )
            .addToggle((cb) => {
                cb.setValue(this.create_enabled).onChange((value) => {
                    this.create_enabled = value;
                });
            });

        new Setting(contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText("Done")
                    .setCta()
                    .onClick(async () => {
                        if (!this.template) {
                            templateSetting.setErrorMessage(
                                "Template cannot be empty",
                            );
                            return;
                        }
                        const error = this.validateTemplate(this.template);
                        if (error) {
                            templateSetting.setErrorMessage(error);
                            return;
                        }
                        if (!this.insert_enabled && !this.create_enabled) {
                            insertSetting.setErrorMessage(
                                "At least one command must be enabled",
                            );
                            return;
                        }
                        await this.onSubmit({
                            template: this.template,
                            insert_enabled: this.insert_enabled,
                            create_enabled: this.create_enabled,
                        });
                        this.close();
                    }),
            )
            .addButton((btn) =>
                btn.setButtonText("Cancel").onClick(() => this.close()),
            );
    }

    onClose() {
        this.contentEl.empty();
    }
}
