import { FuzzySuggestModal, TFile, TFolder, normalizePath } from "obsidian";
import { get_tfiles_from_folder } from "utils/Utils";
import TemplaterPlugin from "main";
import { errorWrapperSync } from "utils/Error";
import { log_error } from "utils/Log";

export enum OpenMode {
    InsertTemplate,
    CreateNoteTemplate,
}

export class FuzzySuggester extends FuzzySuggestModal<TFile> {
    private plugin: TemplaterPlugin;
    private open_mode: OpenMode;
    private creation_folder: TFolder | undefined;

    constructor(plugin: TemplaterPlugin) {
        super(plugin.app);
        this.plugin = plugin;
        this.setPlaceholder("Type name of a template...");
    }

    getItems(): TFile[] {
        if (this.plugin.templater.get_templates_folders().length === 0) {
            return this.app.vault.getMarkdownFiles();
        }

        const files = 
            this.plugin.templater.get_templates_folders()
                .map((folder: string) => {
                    return errorWrapperSync(
                        () =>
                            get_tfiles_from_folder(
                                this.plugin.app,
                                folder
                            ),
                        `Couldn't retrieve template files from templates folder ${folder}`
                    );
                })
                .flat();

        return files;
    }

    getItemText(item: TFile): string {
        const templates_folders_shared_path = this.plugin.templater.get_templates_folders_shared_path()
        let relativePath = item.path;
        if (
            item.path.startsWith(templates_folders_shared_path) &&
            normalizePath(templates_folders_shared_path) != "/"
        ) {
            // Modify splice position if folder has a trailing slash
            const folderLength = templates_folders_shared_path.length
            const position = templates_folders_shared_path.endsWith('/') ? folderLength : folderLength + 1
            relativePath = item.path.slice(
                position
            );
        }
        return relativePath.split(".").slice(0, -1).join(".");
    }

    onChooseItem(item: TFile): void {
        switch (this.open_mode) {
            case OpenMode.InsertTemplate:
                this.plugin.templater.append_template_to_active_file(item);
                break;
            case OpenMode.CreateNoteTemplate:
                this.plugin.templater.create_new_note_from_template(
                    item,
                    this.creation_folder
                );
                break;
        }
    }

    start(): void {
        try {
            this.open();
        } catch (e) {
            log_error(e);
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
