import { AbstractInputSuggest, App, TFolder } from "obsidian";

export class FolderSuggest extends AbstractInputSuggest<TFolder> {
    constructor(
        app: App,
        public inputEl: HTMLInputElement,
    ) {
        super(app, inputEl);
    }

    getSuggestions(inputStr: string): TFolder[] {
        const lowerCaseInputStr = inputStr.toLowerCase();
        const folders = this.app.vault
            .getAllFolders()
            .filter((folder) =>
                folder.path.toLowerCase().includes(lowerCaseInputStr),
            );

        return folders.slice(0, 1000);
    }

    renderSuggestion(file: TFolder, el: HTMLElement): void {
        el.setText(file.path);
    }

    selectSuggestion(file: TFolder): void {
        this.setValue(file.path);
        this.inputEl.trigger("input");
        this.close();
    }
}
