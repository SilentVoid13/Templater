import { t } from "i18n";
import { App, ButtonComponent, Modal, Setting } from "obsidian";
import TemplaterPlugin from "main";
import {
    FileSuggest,
    FileSuggestMode,
} from "settings/suggesters/FileSuggester";

export class StartupTemplateModal extends Modal {
    private template = "";

    constructor(
        app: App,
        private plugin: TemplaterPlugin,
        private onSubmit: (template: string) => Promise<void> | void,
    ) {
        super(app);
    }

    onOpen() {
        this.setTitle(t("Add startup template"));
        const { contentEl } = this;

        this.modalEl.addClass("templater-startup-template-modal");

        const templateSetting = new Setting(contentEl)
            .setName(t("Template"))
            .setDesc(t("Enter a template path, e.g. meta/templates/daily.md"))
            .addText((cb) => {
                new FileSuggest(
                    cb.inputEl,
                    this.plugin,
                    FileSuggestMode.TemplateFiles,
                );
                cb.onChange((value) => {
                    this.template = value;
                });
            });

        const buttonContainer = contentEl.createDiv("modal-button-container");
        new ButtonComponent(buttonContainer)
            .setButtonText(t("Done"))
            .setCta()
            .onClick(async () => {
                if (!this.template) {
                    templateSetting.setErrorMessage(
                        t("Template cannot be empty"),
                    );
                    return;
                }
                await this.onSubmit(this.template);
                this.close();
            });
        new ButtonComponent(buttonContainer)
            .setButtonText(t("Cancel"))
            .onClick(() => this.close());
    }

    onClose() {
        this.contentEl.empty();
    }
}
