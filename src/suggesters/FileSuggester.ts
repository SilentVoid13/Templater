// Credits go to Liam's Periodic Notes Plugin: https://github.com/liamcain/obsidian-periodic-notes

import { App, TAbstractFile, TFile } from "obsidian";
import { TextInputSuggest } from "suggesters/suggest";
import { get_tfiles_from_folder } from 'Utils';
import TemplaterPlugin from 'main';

export enum FileSuggestMode {
    TemplateFiles,
    ScriptFiles,
};

export class FileSuggest extends TextInputSuggest<TFile> {
    constructor(public app: App, public inputEl: HTMLInputElement, private plugin: TemplaterPlugin, private mode: FileSuggestMode) {
        super(app, inputEl);
    }

    get_folder(mode: FileSuggestMode): string {
        switch (mode) {
            case FileSuggestMode.TemplateFiles:
                return this.plugin.settings.templates_folder;
            case FileSuggestMode.ScriptFiles:
                return this.plugin.settings.user_scripts_folder;
        }
    }

    getSuggestions(input_str: string): TFile[] {
        let all_files: TFile[];
        try {
            all_files = get_tfiles_from_folder(this.app, this.get_folder(this.mode));
        } catch (e) {
            return [];
        }

        const files: TFile[] = [];
        const lower_input_str = input_str.toLowerCase();

        all_files.forEach((file: TAbstractFile) => {
            if (
                file instanceof TFile &&
                file.extension === "md" &&
                file.path.toLowerCase().contains(lower_input_str)
            ) {
                files.push(file);
            }
        });

        return files;
    }

    renderSuggestion(file: TFile, el: HTMLElement): void {
        el.setText(file.path);
    }

    selectSuggestion(file: TFile): void {
        this.inputEl.value = file.path;
        this.inputEl.trigger("input");
        this.close();
    }
}
