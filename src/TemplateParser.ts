import * as obsidian from 'obsidian'; 
import { App, MarkdownView, TFile, TFolder } from "obsidian";
import * as Eta from "eta";

import { InternalTemplateParser } from "./InternalTemplates/InternalTemplateParser";
import TemplaterPlugin from "./main";
import { UserTemplateParser } from "./UserTemplates/UserTemplateParser";
import { TParser } from "TParser";
import { CursorJumper } from "CursorJumper";

export enum ContextMode {
    INTERNAL,
    USER_INTERNAL,
    DYNAMIC,
};

export class TemplateParser extends TParser {
    public internalTemplateParser: InternalTemplateParser;
	public userTemplateParser: UserTemplateParser = null;
    private current_context: any;
    public cursor_jumper: CursorJumper;
    
    constructor(app: App, private plugin: TemplaterPlugin) {
        super(app);
        this.cursor_jumper = new CursorJumper(this.app);
        this.internalTemplateParser = new InternalTemplateParser(this.app, this.plugin);
        this.userTemplateParser = new UserTemplateParser(this.app, this.plugin);
    }

    async setCurrentContext(file: TFile, context_mode: ContextMode) {
        this.current_context = await this.generateContext(file, context_mode);
    }

    additionalContext() {
        return {
            obsidian: obsidian,
        };
    }

    async generateContext(file: TFile, context_mode: ContextMode = ContextMode.USER_INTERNAL) {
        let context = {};
        let additional_context = this.additionalContext();
        let internal_context = await this.internalTemplateParser.generateContext(file);
        let user_context = {};

        if (!this.current_context) {
            // If a user system command is using tp.file.include, we need the context to be set.
            this.current_context = internal_context;
        }

        Object.assign(context, additional_context);
        switch (context_mode) {
            case ContextMode.INTERNAL:
                Object.assign(context, internal_context);
                break;
            case ContextMode.DYNAMIC:
                user_context = await this.userTemplateParser.generateContext(file);
                Object.assign(context, {
                    dynamic: {
                        ...internal_context,
                        user: user_context,
                    }
                });
                break;
            case ContextMode.USER_INTERNAL:
                user_context = await this.userTemplateParser.generateContext(file);
                Object.assign(context, {
                    ...internal_context,
                    user: user_context,
                });
                break;
        }

        return context;
    }

    async parseTemplates(content: string, context?: any) {
        if (!context) {
            context = this.current_context;
        }

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

    async create_new_note_from_template(template_file: TFile, folder?: TFolder) {
        try {
            let template_content = await this.app.vault.read(template_file);

            if (!folder) {
                folder = this.app.fileManager.getNewFileParent("");
                //folder = this.app.vault.getConfig("newFileFolderPath");
            }

            // TODO: Change that, not stable atm
            // @ts-ignore
            let created_note = await this.app.fileManager.createNewMarkdownFile(folder, "Untitled");

            await this.setCurrentContext(created_note, ContextMode.USER_INTERNAL);
            let content = await this.plugin.parser.parseTemplates(template_content);

            await this.app.vault.modify(created_note, content);

            let active_leaf = this.app.workspace.activeLeaf;
            if (!active_leaf) {
                throw new Error("No active leaf");
            }
            await active_leaf.openFile(created_note, {state: {mode: 'source'}, eState: {rename: 'all'}});

            await this.cursor_jumper.jump_to_next_cursor_location();
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

        await this.setCurrentContext(active_view.file, ContextMode.USER_INTERNAL);
        content = await this.parseTemplates(content);
        
        doc.replaceSelection(content);

        await this.cursor_jumper.jump_to_next_cursor_location();
        editor.focus();
    }

    async replace_templates_and_overwrite_in_file(file: TFile) {
        let content = await this.app.vault.read(file);

        await this.setCurrentContext(file, ContextMode.USER_INTERNAL);
        let new_content = await this.parseTemplates(content);

        if (new_content !== content) {
            await this.app.vault.modify(file, new_content);
            
            if (this.app.workspace.getActiveFile() === file) {
                await this.cursor_jumper.jump_to_next_cursor_location();
            }
        }
    }
}