import { InternalModule } from "../InternalModule";

import {
    FileSystemAdapter,
    getAllTags,
    MarkdownView,
    normalizePath,
    parseLinktext,
    Platform,
    resolveSubpath,
    TFile,
    TFolder,
} from "obsidian";
import { UNSUPPORTED_MOBILE_TEMPLATE } from "Constants";
import { TemplaterError } from "Error";

export const DEPTH_LIMIT = 10;

export class InternalModuleFile extends InternalModule {
    public name = "file";
    private include_depth = 0;
    private create_new_depth = 0;
    private linkpath_regex = new RegExp("^\\[\\[(.*)\\]\\]$");

    async create_static_templates(): Promise<void> {
        this.static_functions.set(
            "creation_date",
            this.generate_creation_date()
        );
        this.static_functions.set("create_new", this.generate_create_new());
        this.static_functions.set("cursor", this.generate_cursor());
        this.static_functions.set(
            "cursor_append",
            this.generate_cursor_append()
        );
        this.static_functions.set("exists", this.generate_exists());
        this.static_functions.set("find_tfile", this.generate_find_tfile());
        this.static_functions.set("folder", this.generate_folder());
        this.static_functions.set("include", this.generate_include());
        this.static_functions.set(
            "last_modified_date",
            this.generate_last_modified_date()
        );
        this.static_functions.set("move", this.generate_move());
        this.static_functions.set("path", this.generate_path());
        this.static_functions.set("rename", this.generate_rename());
        this.static_functions.set("selection", this.generate_selection());
    }

    async create_dynamic_templates(): Promise<void> {
        this.dynamic_functions.set("content", await this.generate_content());
        this.dynamic_functions.set("tags", this.generate_tags());
        this.dynamic_functions.set("title", this.generate_title());
    }

    async generate_content(): Promise<string> {
        return await this.app.vault.read(this.config.target_file);
    }

    generate_create_new(): (
        template: TFile | string,
        filename: string,
        open_new: boolean,
        folder?: TFolder
    ) => Promise<TFile> {
        return async (
            template: TFile | string,
            filename: string,
            open_new = false,
            folder?: TFolder
        ) => {
            this.create_new_depth += 1;
            if (this.create_new_depth > DEPTH_LIMIT) {
                this.create_new_depth = 0;
                throw new TemplaterError(
                    "Reached create_new depth limit (max = 10)"
                );
            }

            const new_file =
                await this.plugin.templater.create_new_note_from_template(
                    template,
                    folder,
                    filename,
                    open_new
                );

            this.create_new_depth -= 1;

            return new_file;
        };
    }

    generate_creation_date(): (format?: string) => string {
        return (format = "YYYY-MM-DD HH:mm") => {
            return window
                .moment(this.config.target_file.stat.ctime)
                .format(format);
        };
    }

    generate_cursor(): (order?: number) => string {
        return (order?: number) => {
            // Hack to prevent empty output
            return `<% tp.file.cursor(${order ?? ""}) %>`;
        };
    }

    generate_cursor_append(): (content: string) => void {
        return (content: string): string => {
            const active_view =
                this.app.workspace.getActiveViewOfType(MarkdownView);
            if (active_view === null) {
                this.plugin.log_error(
                    new TemplaterError(
                        "No active view, can't append to cursor."
                    )
                );
                return;
            }

            const editor = active_view.editor;
            const doc = editor.getDoc();
            doc.replaceSelection(content);
            return "";
        };
    }

    generate_exists(): (filename: string) => boolean {
        return (filename: string) => {
            // TODO: Remove this, only here to support the old way
            let match;
            if ((match = this.linkpath_regex.exec(filename)) !== null) {
                filename = match[1];
            }

            const file = this.app.metadataCache.getFirstLinkpathDest(
                filename,
                ""
            );
            return file != null;
        };
    }

    generate_find_tfile(): (filename: string) => TFile {
        return (filename: string) => {
            const path = normalizePath(filename);
            return this.app.metadataCache.getFirstLinkpathDest(path, "");
        };
    }

    generate_folder(): (relative?: boolean) => string {
        return (relative = false) => {
            const parent = this.config.target_file.parent;
            let folder;

            if (relative) {
                folder = parent.path;
            } else {
                folder = parent.name;
            }

            return folder;
        };
    }

    generate_include(): (include_link: string | TFile) => Promise<string> {
        return async (include_link: string | TFile) => {
            // TODO: Add mutex for this, this may currently lead to a race condition.
            // While not very impactful, that could still be annoying.
            this.include_depth += 1;
            if (this.include_depth > DEPTH_LIMIT) {
                this.include_depth -= 1;
                throw new TemplaterError(
                    "Reached inclusion depth limit (max = 10)"
                );
            }

            let inc_file_content: string;

            if (include_link instanceof TFile) {
                inc_file_content = await this.app.vault.read(include_link);
            } else {
                let match;
                if ((match = this.linkpath_regex.exec(include_link)) === null) {
                    this.include_depth -= 1;
                    throw new TemplaterError(
                        "Invalid file format, provide an obsidian link between quotes."
                    );
                }
                const { path, subpath } = parseLinktext(match[1]);

                const inc_file = this.app.metadataCache.getFirstLinkpathDest(
                    path,
                    ""
                );
                if (!inc_file) {
                    this.include_depth -= 1;
                    throw new TemplaterError(
                        `File ${include_link} doesn't exist`
                    );
                }
                inc_file_content = await this.app.vault.read(inc_file);

                if (subpath) {
                    const cache = this.app.metadataCache.getFileCache(inc_file);
                    if (cache) {
                        const result = resolveSubpath(cache, subpath);
                        if (result) {
                            inc_file_content = inc_file_content.slice(
                                result.start.offset,
                                result.end?.offset
                            );
                        }
                    }
                }
            }

            try {
                const parsed_content =
                    await this.plugin.templater.parser.parse_commands(
                        inc_file_content,
                        this.plugin.templater.current_functions_object
                    );
                this.include_depth -= 1;
                return parsed_content;
            } catch (e) {
                this.include_depth -= 1;
                throw e;
            }
        };
    }

    generate_last_modified_date(): (format?: string) => string {
        return (format = "YYYY-MM-DD HH:mm"): string => {
            return window
                .moment(this.config.target_file.stat.mtime)
                .format(format);
        };
    }

    generate_move(): (path: string) => Promise<string> {
        return async (path: string) => {
            const new_path = normalizePath(
                `${path}.${this.config.target_file.extension}`
            );
            await this.app.fileManager.renameFile(
                this.config.target_file,
                new_path
            );
            return "";
        };
    }

    generate_path(): (relative: boolean) => string {
        return (relative = false) => {
            // TODO: Add mobile support
            if (Platform.isMobileApp) {
                return UNSUPPORTED_MOBILE_TEMPLATE;
            }
            if (!(this.app.vault.adapter instanceof FileSystemAdapter)) {
                throw new TemplaterError(
                    "app.vault is not a FileSystemAdapter instance"
                );
            }
            const vault_path = this.app.vault.adapter.getBasePath();

            if (relative) {
                return this.config.target_file.path;
            } else {
                return `${vault_path}/${this.config.target_file.path}`;
            }
        };
    }

    generate_rename(): (new_title: string) => Promise<string> {
        return async (new_title: string) => {
            if (new_title.match(/[\\/:]+/g)) {
                throw new TemplaterError(
                    "File name cannot contain any of these characters: \\ / :"
                );
            }
            const new_path = normalizePath(
                `${this.config.target_file.parent.path}/${new_title}.${this.config.target_file.extension}`
            );
            await this.app.fileManager.renameFile(
                this.config.target_file,
                new_path
            );
            return "";
        };
    }

    generate_selection(): () => string {
        return () => {
            const active_view =
                this.app.workspace.getActiveViewOfType(MarkdownView);
            if (active_view == null) {
                throw new TemplaterError(
                    "Active view is null, can't read selection."
                );
            }

            const editor = active_view.editor;
            return editor.getSelection();
        };
    }

    // TODO: Turn this into a function
    generate_tags(): string[] {
        const cache = this.app.metadataCache.getFileCache(
            this.config.target_file
        );
        return getAllTags(cache);
    }

    // TODO: Turn this into a function
    generate_title(): string {
        return this.config.target_file.basename;
    }
}
