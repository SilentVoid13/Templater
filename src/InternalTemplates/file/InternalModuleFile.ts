import { InternalModule } from "../InternalModule";
import { get_date_string } from "../InternalUtils";

import { getAllTags, MarkdownView } from "obsidian";

export class InternalModuleFile extends InternalModule {
    name = "file";

    async generateTemplates() {
        this.templates.set("content", await this.generate_content());
        this.templates.set("creation_date", this.generate_creation_date());
        this.templates.set("folder", this.generate_folder());
        this.templates.set("last_modified_date", this.generate_last_modified_date());
        this.templates.set("path", this.generate_path());
        this.templates.set("selection", this.generate_selection());
        this.templates.set("tags", this.generate_tags());
        this.templates.set("title", this.generate_title());
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

    async generate_content() {
        return await this.app.vault.read(this.file);
    }

    generate_last_modified_date() {
        return (format?: string): string => {
                return get_date_string(format, undefined, this.file.stat.mtime);
        }
    }

    generate_creation_date() {
        return (format?: string) => {
            return get_date_string(format, undefined, this.file.stat.ctime);
        }
    }

    generate_path() {
        return (relative: boolean = false) => {
            // TODO: Mobile support
            /*
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
            */

            return this.file.path;
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

    generate_title() {
        return this.file.name;
    }

    generate_tags() {
        let cache = this.app.metadataCache.getFileCache(this.file);
        return getAllTags(cache);
    }

    /*
    generate_include() {
        return async (inc_file_str: string) => {
            let inc_file = this.app.metadataCache.getFirstLinkpathDest(normalizePath(inc_file_str), "");
            if (!inc_file) {
                throw new Error(`File ${this.file} passed to tp_include doesn't exist`);
            }
            if (!(inc_file instanceof TFile)) {
                throw new Error(`tp_include: ${this.file} is a folder, not a file`);
            }

            let content = await this.app.vault.read(inc_file);
        
            return content;
        }
    }
    */
}