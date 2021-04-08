import { App, EditorPosition, MarkdownView, TFile } from "obsidian";
import * as Eta from "eta";

import { InternalTemplateParser } from "./InternalTemplates/InternalTemplateParser";
import TemplaterPlugin from "./main";
import { UserTemplateParser } from "./UserTemplates/UserTemplateParser";
import { TParser } from "TParser";
import { TP_FILE_CURSOR } from "InternalTemplates/file/InternalModuleFile";

export enum ContextMode {
    USER,
    INTERNAL,
    USER_INTERNAL,
    DYNAMIC,
};

export class TemplateParser extends TParser {
    public internalTemplateParser: InternalTemplateParser;
	public userTemplateParser: UserTemplateParser = null;
    
    constructor(app: App, private plugin: TemplaterPlugin) {
        super(app);
        this.internalTemplateParser = new InternalTemplateParser(this.app, this.plugin);
        // TODO: Add mobile support
        if (!this.app.isMobile) {
            this.userTemplateParser = new UserTemplateParser(this.app, this.plugin);
        }
    }

    async generateContext(file: TFile, context_mode: ContextMode = ContextMode.USER_INTERNAL) {
        let context = {};
        let internal_context = await this.internalTemplateParser.generateContext(file);
        let user_context = {}

        switch (context_mode) {
            case ContextMode.USER:
                if (this.userTemplateParser) {
                    user_context = await this.userTemplateParser.generateContext(file);
                }
                context = {
                    user: {
                        ...user_context
                    }
                };
                break;
            case ContextMode.INTERNAL:
                context = internal_context;
                break;
            case ContextMode.DYNAMIC:
                if (this.userTemplateParser) {
                    user_context = await this.userTemplateParser.generateContext(file);
                }
                context = {
                    dynamic: {
                        ...internal_context,
                        user: {
                            ...user_context
                        }
                    }
                };
                break;
            case ContextMode.USER_INTERNAL:
                if (this.userTemplateParser) {
                    user_context = await this.userTemplateParser.generateContext(file);
                }
                context = {
                    ...internal_context,
                    user: {
                        ...user_context
                    }
                };
                break;
        }

        return {
            ...context
        };
    }

    async parseTemplates(content: string, file: TFile, context_mode: ContextMode) {
        let context = await this.generateContext(file, context_mode);

        try {
            content = await Eta.renderAsync(content, context, {
                varName: "tp",
                parse: {
                    exec: "*",
                    interpolate: "~",
                    raw: "",
                },
                autoTrim: false,
                globalAwait: true,
            }) as string;
        }
        catch(error) {
            this.plugin.log_error("Template parsing error, aborting.", error);
        }

        return content;
    }

    replace_in_active_file(): void {
		try {
			let active_view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (active_view === null) {
				throw new Error("Active view is null");
			}
			this.replace_templates_and_overwrite_in_file(active_view.file);
		}
		catch(error) {
			this.plugin.log_error(error);
		}
	}

    async create_new_note_from_template(template_file: TFile) {
        try {
            let template_content = await this.app.vault.read(template_file);
            let created_note = await this.app.vault.create("Untitled.md", "");
            let content = await this.plugin.parser.parseTemplates(template_content, created_note, ContextMode.USER_INTERNAL);
            await this.app.vault.modify(created_note, content);

            let active_leaf = this.app.workspace.activeLeaf;
            if (!active_leaf) {
                throw new Error("No active leaf");
            }
            await active_leaf.openFile(created_note, {state: {mode: 'source'}, eState: {rename: 'all'}});

            await this.jump_to_next_cursor_location();
        }
		catch(error) {
			this.plugin.log_error(error);
		}
    }

    async replace_templates_and_append(template_file: TFile) {
        let active_view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (active_view === null) {
            throw new Error("No active view, can't append templates.");
        }

        let editor = active_view.editor;
        let doc = editor.getDoc();

        let content = await this.app.vault.read(template_file);
        content = await this.parseTemplates(content, active_view.file, ContextMode.USER_INTERNAL);
        
        doc.replaceSelection(content);

        await this.jump_to_next_cursor_location();
        editor.focus();
    }

    async replace_templates_and_overwrite_in_file(file: TFile) {
        let content = await this.app.vault.read(file);
        let new_content = await this.parseTemplates(content, file, ContextMode.USER_INTERNAL);

        if (new_content !== content) {
            await this.app.vault.modify(file, new_content);
            
            if (this.app.workspace.getActiveFile() === file) {
                await this.jump_to_next_cursor_location();
            }
        }
    }

    async jump_to_next_cursor_location() {
        let active_view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (active_view === null) {
            throw new Error("No active view, can't append templates.");
        }
        let active_file = active_view.file;
        await active_view.save();

        let content = await this.app.vault.read(active_file);

        let pos = this.get_cursor_position(content);
        if (pos) {
            content = content.replace(new RegExp(TP_FILE_CURSOR), "");
            await this.app.vault.modify(active_file, content);
            this.set_cursor_location(pos);
        }
    }

    get_cursor_position(content: string): EditorPosition {
        let pos: EditorPosition = null;
        let index = content.indexOf(TP_FILE_CURSOR);

        if (index !== -1) {
            let substr = content.substr(0, index);

            let l = 0;
            let offset = -1;
            let r = -1;
            for (; (r = substr.indexOf("\n", r+1)) !== -1 ; l++, offset=r);
            offset += 1;

            let ch = content.substr(offset, index-offset).length;

            pos = {line: l, ch: ch};
        }
        return pos;
    }

    set_cursor_location(pos: EditorPosition) {
        if (!pos) {
            return;
        }

        let active_view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (active_view === null) {
            return;
        }
        let editor = active_view.editor;

        editor.focus();
        editor.setCursor(pos);
    }
}