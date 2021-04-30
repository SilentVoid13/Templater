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
        if (this.plugin.settings.template_folder === "") {
            return this.app.vault.getMarkdownFiles();
        }
        return getTFilesFromFolder(this.app, this.plugin.settings.template_folder);
    }

    getItemText(item: TFile): string {
        return item.basename;
    }

    onChooseItem(item: TFile, _evt: MouseEvent | KeyboardEvent): void {
        switch(this.open_mode) {
            case OpenMode.InsertTemplate:
                this.plugin.templater.append_template(item);
                break;
            case OpenMode.CreateNoteTemplate:
                this.plugin.templater.create_new_note_from_template(item, this.creation_folder);
                break;
        }
    }

    start(): void {
        try {
            this.open();
        } catch(e) {
            this.plugin.log_error(e);
        }
    }

    insert_template(): void {
        this.open_mode = OpenMode.InsertTemplate;
        this.start();
    }

    create_new_note_from_template(folder?: TFolder): void {
        this.creation_folder = folder;
        this.open_mode = OpenMode.CreateNoteTemplate;
        this.start();
    }
}
