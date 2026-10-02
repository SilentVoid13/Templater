import { AbstractInputSuggest, TAbstractFile, TFile } from "obsidian";
import { get_tfiles_from_folder } from "utils/Utils";
import TemplaterPlugin from "main";
import { errorWrapperSync } from "utils/Error";

export enum FileSuggestMode {
    TemplateFiles,
    ScriptFiles,
}

export class FileSuggest extends AbstractInputSuggest<TFile> {
    constructor(
        public inputEl: HTMLInputElement,
        private plugin: TemplaterPlugin,
        private mode: FileSuggestMode,
    ) {
        super(plugin.app, inputEl);
    }

    get_folder(mode: FileSuggestMode): string {
        switch (mode) {
            case FileSuggestMode.TemplateFiles:
                return this.plugin.settings.templates_folder;
            case FileSuggestMode.ScriptFiles:
                return this.plugin.settings.user_scripts_folder;
        }
    }

    get_error_msg(mode: FileSuggestMode): string {
        switch (mode) {
            case FileSuggestMode.TemplateFiles:
                return `Templates folder doesn't exist`;
            case FileSuggestMode.ScriptFiles:
                return `User Scripts folder doesn't exist`;
        }
    }

    getSuggestions(inputStr: string): TFile[] {
        const all_files = errorWrapperSync(
            () =>
                get_tfiles_from_folder(
                    this.plugin.app,
                    this.get_folder(this.mode),
                ),
            this.get_error_msg(this.mode),
        );
        if (!all_files) {
            return [];
        }

        const files: TFile[] = [];
        const lowerCaseInputStr = inputStr.toLowerCase();

        all_files.forEach((file: TAbstractFile) => {
            if (
                file instanceof TFile &&
                file.path.toLowerCase().includes(lowerCaseInputStr)
            ) {
                files.push(file);
            }
        });

        return files.slice(0, 1000);
    }

    renderSuggestion(file: TFile, el: HTMLElement): void {
        el.setText(file.path);
    }

    selectSuggestion(file: TFile): void {
        this.setValue(file.path);
        this.inputEl.trigger("input");
        this.close();
    }
}
