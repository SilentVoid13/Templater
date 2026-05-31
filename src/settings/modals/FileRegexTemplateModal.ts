import { App, Modal, Setting } from "obsidian";
import TemplaterPlugin from "main";
import {
    FileSuggest,
    FileSuggestMode,
} from "settings/suggesters/FileSuggester";

export class FileRegexTemplateModal extends Modal {
    private regex: string;
    private template: string;

    constructor(
        app: App,
        private plugin: TemplaterPlugin,
        initialValues: { regex: string; template: string },
        private onSubmit: (
            regex: string,
            template: string,
        ) => Promise<void> | void,
    ) {
        super(app);
        this.regex = initialValues.regex;
        this.template = initialValues.template;
    }

    onOpen() {
        this.setTitle("File regex template");
        this.modalEl.addClass("templater-file-regex-template-modal");
        const { contentEl } = this;

        const regexSetting = new Setting(contentEl)
            .setName("File regex")
            .setDesc(
                "Regex to match on. Tests against full file path relative to the root of the vault, including file extension.",
            )
            .addText((cb) => {
                cb.setPlaceholder("File regex")
                    .setValue(this.regex)
                    .onChange((value) => {
                        this.regex = value;
                    });
            });

        const templateSetting = new Setting(contentEl)
            .setName("Template")
            .setDesc("Template to apply on match.")
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

        new Setting(contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText("Done")
                    .setCta()
                    .onClick(async () => {
                        if (!this.regex) {
                            regexSetting.setErrorMessage(
                                "File regex cannot be empty",
                            );
                            return;
                        }
                        if (!this.template) {
                            templateSetting.setErrorMessage(
                                "Template cannot be empty",
                            );
                            return;
                        }
                        await this.onSubmit(this.regex, this.template);
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
