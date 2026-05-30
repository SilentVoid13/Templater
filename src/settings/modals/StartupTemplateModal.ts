import { App, ButtonComponent, Modal } from "obsidian";
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
        this.setTitle("Add startup template");
        const { contentEl } = this;

        this.modalEl.addClass("templater-startup-template-modal");

        const input = contentEl.createEl("input", { type: "text" });
        new FileSuggest(input, this.plugin, FileSuggestMode.TemplateFiles);
        input.addEventListener("input", () => {
            this.template = input.value;
        });

        contentEl.createEl("p", {
            text: "Enter a template path, e.g. meta/templates/daily.md",
            cls: "setting-item-description",
        });

        const buttonContainer = this.contentEl.createDiv(
            "modal-button-container",
        );
        new ButtonComponent(buttonContainer)
            .setButtonText("Done")
            .setCta()
            .onClick(async () => {
                await this.onSubmit(this.template);
                this.close();
            });
        new ButtonComponent(buttonContainer)
            .setButtonText("Cancel")
            .onClick(() => this.close());
    }

    onClose() {
        this.contentEl.empty();
    }
}
