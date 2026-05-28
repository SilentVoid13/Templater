import { App, ButtonComponent, Modal } from "obsidian";
import { FolderSuggest } from "settings/suggesters/FolderSuggester";

export class IgnoreFolderModal extends Modal {
    private folder = "";

    constructor(
        app: App,
        private onSubmit: (folder: string) => Promise<void> | void,
    ) {
        super(app);
    }

    onOpen() {
        this.setTitle("Add exclusion");
        const { contentEl } = this;

        this.modalEl.addClass("templater-ignore-folder-modal");

        const input = contentEl.createEl("input", { type: "text" });
        new FolderSuggest(this.app, input);
        input.addEventListener("input", () => {
            this.folder = input.value;
        });

        contentEl.createEl("p", {
            // eslint-disable-next-line obsidianmd/ui/sentence-case -- This is sentence case, the e.g. is throwing off the linter
            text: "Enter a path, e.g. meta/templates",
            cls: "setting-item-description",
        });

        const buttonContainer = contentEl.createDiv("modal-button-container");
        new ButtonComponent(buttonContainer)
            .setButtonText("Done")
            .setCta()
            .onClick(async () => {
                await this.onSubmit(this.folder);
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
