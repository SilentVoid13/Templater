import { InternalModule } from "../InternalModule";

import { FileSystemAdapter, getAllTags, MarkdownView, normalizePath, parseLinktext, resolveSubpath, TFile } from "obsidian";
import { UNSUPPORTED_MOBILE_TEMPLATE } from "Constants";

export const DEPTH_LIMIT = 10;

export class InternalModuleFile extends InternalModule {
    public name: string = "file";
    private include_depth: number = 0;
    private linkpath_regex: RegExp = new RegExp("^\\[\\[(.*)\\]\\]$");

    async createStaticTemplates(): Promise<void> {
        this.static_templates.set("cursor", this.generate_cursor());
        this.static_templates.set("selection", this.generate_selection());
    }

    async updateTemplates(): Promise<void> {
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

    generate_cursor(): Function {
        return (order?: number) => {
            // Hack to prevent empty output
            return `<% tp.file.cursor(${order ?? ''}) %>`;
        }
    }

    async generate_content(): Promise<string> {
        return await this.app.vault.read(this.file);
    }

    generate_creation_date(): Function {
        return (format: string = "YYYY-MM-DD HH:mm") => {
            return window.moment(this.file.stat.ctime).format(format);
        }
    }

    generate_folder(): Function {
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

    generate_include(): Function {
        return async (include_link: string) => {
            // TODO: Add mutex for this, this may currently lead to a race condition. 
            // While not very impactful, that could still be annoying.
            this.include_depth += 1;
            if (this.include_depth > DEPTH_LIMIT) {
                this.include_depth = 0;
                throw new Error("Reached inclusion depth limit (max = 10)");
            }

            let match;
            if ((match = this.linkpath_regex.exec(include_link)) === null) {
                throw new Error("Invalid file format, provide an obsidian link between quotes.");
            }
            const {path, subpath} = parseLinktext(match[1]);

            let inc_file = this.app.metadataCache.getFirstLinkpathDest(path, "");
            if (!inc_file) {
                throw new Error(`File ${include_link} doesn't exist`);
            }
            if (!(inc_file instanceof TFile)) {
                throw new Error(`${include_link} is a folder, not a file`);
            }

            let inc_file_content = await this.app.vault.read(inc_file);
            if (subpath) {
                let cache = this.app.metadataCache.getFileCache(inc_file);
                if (cache) {
                    let result = resolveSubpath(cache, subpath);
                    if (result) {
                        inc_file_content = inc_file_content.slice(result.start.offset, result.end?.offset);
                    }
                }
            }

            let parsed_content = await this.plugin.templater.parser.parseTemplates(inc_file_content);
            
            this.include_depth -= 1;
        
            return parsed_content;
        }
    }

    generate_last_modified_date(): Function {
        return (format: string = "YYYY-MM-DD HH:mm"): string => {
            return window.moment(this.file.stat.mtime).format(format);
        }
    }

    generate_path(): Function {
        return (relative: boolean = false) => {
            // TODO: Add mobile support
            // @ts-ignore
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

    generate_rename(): Function {
        return async (new_title: string) => {
            let new_path = normalizePath(`${this.file.parent.path}/${new_title}.${this.file.extension}`);
            await this.app.fileManager.renameFile(this.file, new_path);
            return "";
        }
    }

    generate_selection(): Function {
        return () => {
            let active_view = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (active_view == null) {
                throw new Error("Active view is null, can't read selection.");
            }

            let editor = active_view.editor;
            return editor.getSelection();
        }
    }

    generate_tags(): string[] {
        let cache = this.app.metadataCache.getFileCache(this.file);
        return getAllTags(cache);
    }

    generate_title(): string {
        return this.file.basename;
    }
}