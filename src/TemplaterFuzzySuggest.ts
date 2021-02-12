import { App, FileSystemAdapter, FuzzySuggestModal, MarkdownView, Notice, TFile, TFolder, normalizePath } from "obsidian";
import TemplaterPlugin from './main';

export class TemplaterFuzzySuggestModal extends FuzzySuggestModal<TFile> {
    app: App;
    plugin: TemplaterPlugin;

    constructor(app: App, plugin: TemplaterPlugin) {
        super(app);
        this.app = app;
        this.plugin = plugin;
    }

    getItems(): TFile[] {
        let template_files: TFile[] = [];

        if (this.plugin.settings.template_folder === "") {
            let files = this.app.vault.getFiles();
            template_files = files;
        }
        else {
            let settings_folder = normalizePath(this.plugin.settings.template_folder);

            let abstract_files = this.app.vault.getAbstractFileByPath(settings_folder);
            if (!abstract_files) {
                throw new Error(settings_folder + " folder doesn't exist");
            }
            if (! (abstract_files instanceof TFolder)) {
                throw new Error(settings_folder + " is a file, not a folder");
            }
            // TODO: Use obsidian API for this
            template_files = this.get_all_files_from(abstract_files);
        }

        return template_files;
    }

    getItemText(item: TFile): string {
        return item.basename;
    }

    onChooseItem(item: TFile, _evt: MouseEvent | KeyboardEvent): void {
       this.plugin.parser.replace_templates_and_append(item);
    }

    start(): void {
        // If there is only one file in the templates directory, we don't open the modal
        try {
            let files = this.getItems();
            if (files.length == 1) {
                this.plugin.parser.replace_templates_and_append(files[0]);
            }
            else {
                this.open();
            }
        }
        catch(error) {
            new Notice(error);
        }
    }

    get_all_files_from(file: TFolder) {
        let files: Array<TFile> = [];
        for (let f of file.children) {
            if (f instanceof TFile) {
                files.push(f);
            }
            else {
                if (f instanceof TFolder) {
                    files = files.concat(this.get_all_files_from(f));
                }
                else {
                    throw new Error("Unknown TAbstractFile type");
                }
            }
        }
        return files;
    }
}
