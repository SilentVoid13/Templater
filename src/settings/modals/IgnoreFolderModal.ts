import { App, ButtonComponent, Modal, Setting } from "obsidian";
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

        const folderSetting = new Setting(contentEl)
            .setName("Folder")
            // eslint-disable-next-line obsidianmd/ui/sentence-case -- This is sentence case, the e.g. is throwing off the linter
            .setDesc("Enter a path, e.g. meta/templates")
            .addText((cb) => {
                new FolderSuggest(this.app, cb.inputEl);
                cb.onChange((value) => {
                    this.folder = value;
                });
            });

        const buttonContainer = contentEl.createDiv("modal-button-container");
        new ButtonComponent(buttonContainer)
            .setButtonText("Done")
            .setCta()
            .onClick(async () => {
                if (!this.folder) {
                    folderSetting.setErrorMessage("Folder cannot be empty");
                    return;
                }
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
