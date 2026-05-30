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
        this.containerEl.addClass("templater-fuzzy-suggester-modal");
    }

    getItems(): TFile[] {
        if (!this.plugin.settings.templates_folder) {
            return this.app.vault.getMarkdownFiles();
        }
        const files = errorWrapperSync(
            () =>
                get_tfiles_from_folder(
                    this.plugin.app,
                    this.plugin.settings.templates_folder,
                ),
            `Couldn't retrieve template files from templates folder ${this.plugin.settings.templates_folder}`,
        );
        if (!files) {
            return [];
        }
        return files;
    }

    getItemText(item: TFile): string {
        let relativePath = item.path;
        if (
            item.path.startsWith(this.plugin.settings.templates_folder) &&
            normalizePath(this.plugin.settings.templates_folder) != "/"
        ) {
            // Modify splice position if folder has a trailing slash
            const folderLength = this.plugin.settings.templates_folder.length;
            let position: number;
            if (folderLength === 0) {
                position = 0;
            } else if (this.plugin.settings.templates_folder.endsWith("/")) {
                position = folderLength;
            } else {
                position = folderLength + 1;
            }
            relativePath = item.path.slice(position);
        }
        return relativePath.split(".").slice(0, -1).join(".");
    }

    onChooseItem(item: TFile): void {
        switch (this.open_mode) {
            case OpenMode.InsertTemplate:
                void this.plugin.templater.append_template_to_active_file(item);
                break;
            case OpenMode.CreateNoteTemplate:
                this.app.workspace.activeEditor?.editor ? 
                    void this.plugin.templater.create_new_note_from_template(
                        item,
                        this.creation_folder,
                    ) : 
                    // Wait for editor initialization before template execution
                    setTimeout(() => {
                        void this.plugin.templater.create_new_note_from_template(
                            item,
                            this.creation_folder,
                        );
                    }, 100);
                break;
        }
    }

    start(): void {
        try {
            this.open();
        } catch (e) {
            log_error(e instanceof Error ? e : new Error(String(e)));
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
