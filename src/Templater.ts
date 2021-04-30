import { App, MarkdownPostProcessorContext, MarkdownView, TFile, TFolder } from "obsidian";

import { CursorJumper } from "CursorJumper";
import TemplaterPlugin from "main";
import { ContextMode, TemplateParser } from "TemplateParser";

// TODO: Add proper error handling
export class Templater {
    public parser: TemplateParser;
    public cursor_jumper: CursorJumper;

    constructor(private app: App, private plugin: TemplaterPlugin) {
        this.cursor_jumper = new CursorJumper(this.app);
		this.parser = new TemplateParser(this.app, this.plugin);
    }

    async read_and_parse_template(template_file: TFile, target_file: TFile): Promise<string> {
        const template_content = await this.app.vault.read(template_file);
        await this.parser.setCurrentContext(target_file, ContextMode.USER_INTERNAL);
        const content = await this.parser.parseTemplates(template_content);
        return content;
    }

    async create_new_note_from_template(template_file: TFile, folder?: TFolder): Promise<void> {
        if (!folder) {
            folder = this.app.fileManager.getNewFileParent("");
        }
        // TODO: Change that, not stable atm
        // @ts-ignore
        const created_note = await this.app.fileManager.createNewMarkdownFile(folder, "Untitled");

        // TODO TODO: Handle error
        const output_content = await this.read_and_parse_template(template_file, created_note);
        /* 
        let content;
        try {
            content = await this.plugin.parser.parseTemplates(template_content, undefined, true);
        } catch(error) {
            await this.app.vault.delete(created_note);
            return;
        }
        */
        await this.app.vault.modify(created_note, output_content);

        const active_leaf = this.app.workspace.activeLeaf;
        if (!active_leaf) {
            throw new Error("No active leaf");
        }
        await active_leaf.openFile(created_note, {state: {mode: 'source'}, eState: {rename: 'all'}});

        await this.cursor_jumper.jump_to_next_cursor_location();
    }

    async append_template(template_file: TFile): Promise<void> {
        const active_view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (active_view === null) {
            throw new Error("No active view, can't append templates.");
        }
        const output_content = await this.read_and_parse_template(template_file, active_view.file);

        const editor = active_view.editor;
        const doc = editor.getDoc();
        doc.replaceSelection(output_content);

        await this.cursor_jumper.jump_to_next_cursor_location();
    }

    overwrite_active_file_templates(): void {
		try {
			const active_view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (active_view === null) {
				throw new Error("Active view is null");
			}
			this.overwrite_file_templates(active_view.file);
		}
		catch(error) {
			this.plugin.log_error(error);
		}
	}

    async overwrite_file_templates(file: TFile): Promise<void> {
        const output_content = await this.read_and_parse_template(file, file);
        await this.app.vault.modify(file, output_content);
        if (this.app.workspace.getActiveFile() === file) {
            await this.cursor_jumper.jump_to_next_cursor_location();
        }
    }

    async process_dynamic_templates(el: HTMLElement, ctx: MarkdownPostProcessorContext): Promise<void> {
		const content = el.innerText.trim();
		if (content.contains("tp.dynamic")) {
			const file = this.app.metadataCache.getFirstLinkpathDest("", ctx.sourcePath);
			if (!file || !(file instanceof TFile)) {
				return;
			}
			await this.parser.setCurrentContext(file, ContextMode.DYNAMIC);
			const new_content = await this.parser.parseTemplates(content);
			el.innerText = new_content;
		}
	}
}