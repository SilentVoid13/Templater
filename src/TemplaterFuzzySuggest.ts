import { App, FuzzySuggestModal, TFile, TFolder, normalizePath, Vault, TAbstractFile } from "obsidian";
import { getTFilesFromFolder } from "Utils";
import TemplaterPlugin from './main';

export enum OpenMode {
    InsertTemplate,
    CreateNoteTemplate,
};

export class TemplaterFuzzySuggestModal extends FuzzySuggestModal<TFile> {
    public app: App;
    private plugin: TemplaterPlugin;
    private open_mode: OpenMode;
    private creation_folder: TFolder;

    constructor(app: App, plugin: TemplaterPlugin) {
        super(app);
        this.app = app;
        this.plugin = plugin;
    }

    getItems(): TFile[] {
        let template_files: TFile[] = [];

        if (this.plugin.settings.template_folder === "") {
            template_files = this.app.vault.getMarkdownFiles();
        }
        else {
            template_files = getTFilesFromFolder(this.app, this.plugin.settings.template_folder);
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
                this.plugin.parser.create_new_note_from_template(item, this.creation_folder);
                break;
        }
    }

    start(): void {
        try {
            let files = this.getItems();
            // If there is only one file in the templates directory, we don't open the modal
            if (files.length === 1) {
                this.onChooseItem(files[0], null);
            }
            else {
                this.open();
            }
        }
        catch(error) {
            this.plugin.log_error(error);
        }
    }

    insert_template(): void {
        this.open_mode = OpenMode.InsertTemplate;
        this.start();
    }

    create_new_note_from_template(folder?: TFolder) {
        this.creation_folder = folder;
        this.open_mode = OpenMode.CreateNoteTemplate;
        this.start();
    }
}
