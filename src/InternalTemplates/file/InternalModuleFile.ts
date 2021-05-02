import { InternalModule } from "../InternalModule";

import { FileSystemAdapter, getAllTags, MarkdownView, normalizePath, parseLinktext, resolveSubpath, TFile } from "obsidian";
import { UNSUPPORTED_MOBILE_TEMPLATE } from "Constants";
import { TemplaterError } from "Error";

export const DEPTH_LIMIT = 10;

export class InternalModuleFile extends InternalModule {
    public name: string = "file";
    private include_depth: number = 0;
    private linkpath_regex: RegExp = new RegExp("^\\[\\[(.*)\\]\\]$");

    async createStaticTemplates(): Promise<void> {
        this.static_templates.set("creation_date", this.generate_creation_date());
        this.static_templates.set("cursor", this.generate_cursor());
        this.static_templates.set("exists", this.generate_exists());
        this.static_templates.set("folder", this.generate_folder());
        this.static_templates.set("include", this.generate_include());
        this.static_templates.set("last_modified_date", this.generate_last_modified_date());
        this.static_templates.set("move", this.generate_move());
        this.static_templates.set("path", this.generate_path());
        this.static_templates.set("rename", this.generate_rename());
        this.static_templates.set("selection", this.generate_selection());
    }

    async updateTemplates(): Promise<void> {
        this.dynamic_templates.set("content", await this.generate_content());
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
        return await this.app.vault.read(this.config.target_file);
    }

    generate_creation_date(): Function {
        return (format: string = "YYYY-MM-DD HH:mm") => {
            return window.moment(this.config.target_file.stat.ctime).format(format);
        }
    }

    generate_exists(): Function {
        return (file_link: string) => {
            let match;
            if ((match = this.linkpath_regex.exec(file_link)) === null) {
                throw new TemplaterError("Invalid file format, provide an obsidian link between quotes.");
            }
            const file = this.app.metadataCache.getFirstLinkpathDest(match[1], "");
            return file != null;
        }
    }

    generate_folder(): Function {
        return (relative: boolean = false) => {
            let parent = this.config.target_file.parent;
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
                throw new TemplaterError("Reached inclusion depth limit (max = 10)");
            }

            let match;
            if ((match = this.linkpath_regex.exec(include_link)) === null) {
                throw new TemplaterError("Invalid file format, provide an obsidian link between quotes.");
            }
            const {path, subpath} = parseLinktext(match[1]);

            const inc_file = this.app.metadataCache.getFirstLinkpathDest(path, "");
            if (!inc_file) {
                throw new TemplaterError(`File ${include_link} doesn't exist`);
            }

            let inc_file_content = await this.app.vault.read(inc_file);
            if (subpath) {
                const cache = this.app.metadataCache.getFileCache(inc_file);
                if (cache) {
                    const result = resolveSubpath(cache, subpath);
                    if (result) {
                        inc_file_content = inc_file_content.slice(result.start.offset, result.end?.offset);
                    }
                }
            }

            const parsed_content = await this.plugin.templater.parser.parseTemplates(inc_file_content);
            
            this.include_depth -= 1;
        
            return parsed_content;
        }
    }

    generate_last_modified_date(): Function {
        return (format: string = "YYYY-MM-DD HH:mm"): string => {
            return window.moment(this.config.target_file.stat.mtime).format(format);
        }
    }

    generate_move(): Function {
        return async (path: string) => {
            const new_path = normalizePath(`${path}.${this.config.target_file.extension}`);
            await this.app.fileManager.renameFile(this.config.target_file, new_path);
            return "";
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
                throw new TemplaterError("app.vault is not a FileSystemAdapter instance");
            }
            const vault_path = this.app.vault.adapter.getBasePath();

            if (relative) {
                return this.config.target_file.path;
            }
            else {
                return `${vault_path}/${this.config.target_file.path}`;
            }
        }
    }

    generate_rename(): Function {
        return async (new_title: string) => {
            if (new_title.match(/[\\\/:]+/g)) {
                throw new TemplaterError("File name cannot contain any of these characters: \\ / :");
            }
            const new_path = normalizePath(`${this.config.target_file.parent.path}/${new_title}.${this.config.target_file.extension}`);
            await this.app.fileManager.renameFile(this.config.target_file, new_path);
            return "";
        }
    }

    generate_selection(): Function {
        return () => {
            const active_view = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (active_view == null) {
                throw new TemplaterError("Active view is null, can't read selection.");
            }

            const editor = active_view.editor;
            return editor.getSelection();
        }
    }

    // TODO: Turn this into a function
    generate_tags(): string[] {
        const cache = this.app.metadataCache.getFileCache(this.config.target_file);
        return getAllTags(cache);
    }

    // TODO: Turn this into a function
    generate_title(): string {
        return this.config.target_file.basename;
    }
}