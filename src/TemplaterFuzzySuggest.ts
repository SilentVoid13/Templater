import { App, FuzzySuggestModal, TFile, TFolder, normalizePath, Vault, TAbstractFile } from "obsidian";
import TemplaterPlugin from './main';

export enum OpenMode {
    InsertTemplate,
    CreateNoteTemplate,
};

export class TemplaterFuzzySuggestModal extends FuzzySuggestModal<TFile> {
    app: App;
    plugin: TemplaterPlugin;
    open_mode: OpenMode;

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
            let template_folder_str = normalizePath(this.plugin.settings.template_folder);

            let template_folder = this.app.vault.getAbstractFileByPath(template_folder_str);
            if (!template_folder) {
                throw new Error(`${template_folder_str} folder doesn't exist`);
            }
            if (! (template_folder instanceof TFolder)) {
                throw new Error(`${template_folder_str} is a file, not a folder`);
            }

            Vault.recurseChildren(template_folder, (file: TAbstractFile) => {
                if (file instanceof TFile) {
                    template_files.push(file);
                }
            });
        }

        return template_files;
    }

    getItemText(item: TFile): string {
        return item.basename;
    }

    onChooseItem(item: TFile, _evt: MouseEvent | KeyboardEvent): void {
        switch(this.open_mode) {
            case OpenMode.InsertTemplate:
                this.plugin.parser.replace_templates_and_append(item);
                break;
            case OpenMode.CreateNoteTemplate:
                this.plugin.parser.create_new_note_from_template(item);
                break;
        }
    }

    insert_template(): void {
        this.open_mode = OpenMode.InsertTemplate;

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
            this.plugin.log_error(error);
        }
    }

    create_new_note_from_template() {
        this.open_mode = OpenMode.CreateNoteTemplate;

        try {
            this.open();
        }
        catch(error) {
            this.plugin.log_error(error);
        }
    }
}
