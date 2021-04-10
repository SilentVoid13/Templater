import { InternalModule } from "../InternalModule";
import { get_date_string, UNSUPPORTED_MOBILE_TEMPLATE } from "../InternalUtils";

import { FileSystemAdapter, getAllTags, MarkdownView, normalizePath, TFile } from "obsidian";

export const DEPTH_LIMIT = 10;

export class InternalModuleFile extends InternalModule {
    name = "file";
    private include_depth: number = 0;

    async createStaticTemplates() {
        this.static_templates.set("clipboard", this.generate_clipboard());
        this.static_templates.set("cursor", this.generate_cursor());
        this.static_templates.set("selection", this.generate_selection());
    }

    async updateTemplates() {
        this.dynamic_templates.set("content", await this.generate_content());
        this.dynamic_templates.set("creation_date", this.generate_creation_date());
        this.dynamic_templates.set("folder", this.generate_folder());
        this.dynamic_templates.set("include", this.generate_include());
        this.dynamic_templates.set("last_modified_date", this.generate_last_modified_date());
        this.dynamic_templates.set("path", this.generate_path());
        this.dynamic_templates.set("rename", this.generate_rename());
        this.dynamic_templates.set("tags", this.generate_tags());
        this.dynamic_templates.set("title", this.generate_title());

    }

    generate_clipboard() {
        return async () => {
            // TODO: Add mobile support
            if (this.app.isMobile) {
                return UNSUPPORTED_MOBILE_TEMPLATE;
            }
            return await navigator.clipboard.readText();
        }
    }

    generate_cursor() {
        return (order?: number) => {
            // Hack to prevent empty output
            return `<% tp.file.cursor(${order ?? ''}) %>`;
        }
    }

    async generate_content() {
        return await this.app.vault.read(this.file);
    }

    generate_creation_date() {
        return (format: string = "YYYY-MM-DD HH:mm") => {
            return get_date_string(format, undefined, this.file.stat.ctime);
        }
    }

    generate_folder() {
        return (relative: boolean = false) => {
            let parent = this.file.parent;
            let folder;

            if (relative) {
                folder = parent.path;
            }
            else {
                folder = parent.name;
            }
            
            return folder;
        }
    }

    generate_include() {
        return async (include_filename: string) => {
            let inc_file = this.app.metadataCache.getFirstLinkpathDest(normalizePath(include_filename), "");
            if (!inc_file) {
                throw new Error(`File ${include_filename} doesn't exist`);
            }
            if (!(inc_file instanceof TFile)) {
                throw new Error(`${include_filename} is a folder, not a file`);
            }

            // TODO: Add mutex for this, this may currently lead to a race condition. 
            // While not very impactful, that could still be annoying.
            this.include_depth += 1;
            if (this.include_depth > DEPTH_LIMIT) {
                this.include_depth = 0;
                throw new Error("Reached inclusion depth limit (max = 10)");
            }

            let inc_file_content = await this.app.vault.read(inc_file);
            let parsed_content = await this.plugin.parser.parseTemplates(inc_file_content);
            
            this.include_depth -= 1;
        
            return parsed_content;
        }
    }

    generate_last_modified_date() {
        return (format: string = "YYYY-MM-DD HH:mm"): string => {
            return get_date_string(format, undefined, this.file.stat.mtime);
        }
    }

    generate_path() {
        return (relative: boolean = false) => {
            // TODO: Add mobile support
            if (this.app.isMobile) {
                return UNSUPPORTED_MOBILE_TEMPLATE;
            }
            if (!(this.app.vault.adapter instanceof FileSystemAdapter)) {
                throw new Error("app.vault is not a FileSystemAdapter instance");
            }
            let vault_path = this.app.vault.adapter.getBasePath();

            if (relative) {
                return this.file.path;
            }
            else {
                return `${vault_path}/${this.file.path}`;
            }
        }
    }

    generate_rename() {
        return async (new_title: string) => {
            let new_path = normalizePath(`${this.file.parent.path}/${new_title}.${this.file.extension}`);
            await this.app.fileManager.renameFile(this.file, new_path);
            return "";
        }
    }

    generate_selection() {
        return () => {
            let active_view = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (active_view == null) {
                throw new Error("Active view is null");
            }

            let editor = active_view.editor;
            return editor.getSelection();
        }
    }

    generate_tags() {
        let cache = this.app.metadataCache.getFileCache(this.file);
        return getAllTags(cache);
    }

    generate_title() {
        return this.file.basename;
    }
}