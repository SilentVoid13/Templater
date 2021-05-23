import { App, MarkdownPostProcessorContext, MarkdownView, TFile, TFolder } from "obsidian";

import { CursorJumper } from "CursorJumper";
import TemplaterPlugin from "main";
import { ContextMode, TemplateParser } from "TemplateParser";
import { TemplaterError } from "Error";

export enum RunMode {
    CreateNewFromTemplate,
    AppendActiveFile,
    OverwriteFile,
    OverwriteActiveFile,
    DynamicProcessor,
};

export interface RunningConfig {
    template_file: TFile,
    target_file: TFile,
    run_mode: RunMode,
};

export class Templater {
    public parser: TemplateParser;
    public cursor_jumper: CursorJumper;

    constructor(private app: App, private plugin: TemplaterPlugin) {
        this.cursor_jumper = new CursorJumper(this.app);
		this.parser = new TemplateParser(this.app, this.plugin);
    }

    async setup() {
        await this.parser.init();
    }

    create_running_config(template_file: TFile, target_file: TFile, run_mode: RunMode) {
        return {
            template_file: template_file,
            target_file: target_file,
            run_mode: run_mode,
        }
    }

    async read_and_parse_template(config: RunningConfig): Promise<string> {
        const template_content = await this.app.vault.read(config.template_file);
        await this.parser.setCurrentContext(config, ContextMode.USER_INTERNAL);
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

        const running_config = this.create_running_config(template_file, created_note, RunMode.CreateNewFromTemplate);

        const output_content = await this.plugin.errorWrapper(async () => this.read_and_parse_template(running_config));
        if (output_content == null) {
            await this.app.vault.delete(created_note);
            return;
        }
        await this.app.vault.modify(created_note, output_content);

        const active_leaf = this.app.workspace.activeLeaf;
        if (!active_leaf) {
            this.plugin.log_error(new TemplaterError("No active leaf"));
            return;
        }
        await active_leaf.openFile(created_note, {state: {mode: 'source'}, eState: {rename: 'all'}});

        await this.cursor_jumper.jump_to_next_cursor_location();
    }

    async append_template(template_file: TFile): Promise<void> {
        const active_view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (active_view === null) {
            this.plugin.log_error(new TemplaterError("No active view, can't append templates."));
            return;
        }
        const running_config = this.create_running_config(template_file, active_view.file, RunMode.AppendActiveFile);
        const output_content = await this.plugin.errorWrapper(async () => this.read_and_parse_template(running_config));
        if (output_content == null) {
            return;
        }

        const editor = active_view.editor;
        const doc = editor.getDoc();
        doc.replaceSelection(output_content);

        await this.cursor_jumper.jump_to_next_cursor_location();
    }

    overwrite_active_file_templates(): void {
        const active_view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (active_view === null) {
			this.plugin.log_error(new TemplaterError("Active view is null, can't overwrite content"));
            return;
        }
        this.overwrite_file_templates(active_view.file, true);
	}

    async overwrite_file_templates(file: TFile, active_file: boolean = false): Promise<void> {
        const running_config = this.create_running_config(file, file, active_file ? RunMode.OverwriteActiveFile : RunMode.OverwriteFile);
        const output_content = await this.plugin.errorWrapper(async () => this.read_and_parse_template(running_config));
        if (output_content == null) {
            return;
        }
        await this.app.vault.modify(file, output_content);
        if (this.app.workspace.getActiveFile() === file) {
            await this.cursor_jumper.jump_to_next_cursor_location();
        }
    }

    async process_dynamic_templates(el: HTMLElement, ctx: MarkdownPostProcessorContext): Promise<void> {
        const dynamic_command_regex: RegExp = /(<%(?:-|_)?\s*[*~]{0,1})\+((?:.|\s)*?%>)/g;

        const walker = document.createNodeIterator(el, NodeFilter.SHOW_TEXT);
        let node;
        let pass = false;
        while ((node = walker.nextNode())) {
            let content = node.nodeValue;
            let match;
            if ((match = dynamic_command_regex.exec(content)) != null) {
                const file = this.app.metadataCache.getFirstLinkpathDest("", ctx.sourcePath);
                if (!file || !(file instanceof TFile)) {
                    return;
                }
                if (!pass) {
                    pass = true;
                    const running_config = this.create_running_config(file, file, RunMode.DynamicProcessor);
                    await this.parser.setCurrentContext(running_config, ContextMode.USER_INTERNAL);
                }

                while (match != null) {
                    // Not the most efficient way to exclude the '+' from the command but I couldn't find something better
                    const complete_command = match[1] + match[2];
                    const command_output: string = await this.plugin.errorWrapper(async () => {
                        return await this.parser.parseTemplates(complete_command);
                    });
                    if (command_output == null) {
                        return;
                    }
                    let start = dynamic_command_regex.lastIndex - match[0].length;
                    let end = dynamic_command_regex.lastIndex;
                    content = content.substring(0, start) + command_output + content.substring(end);

                    dynamic_command_regex.lastIndex += (command_output.length - match[0].length);
                    match = dynamic_command_regex.exec(content);
                }
                node.nodeValue = content;
            }
        }
	}
}