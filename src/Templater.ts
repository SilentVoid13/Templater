import { App, normalizePath, MarkdownPostProcessorContext, MarkdownView, TAbstractFile, TFile, TFolder } from "obsidian";

import { resolve_tfile, delay } from 'Utils';
import TemplaterPlugin from "main";
import { FunctionsMode, FunctionsGenerator } from "functions/FunctionsGenerator";
import { errorWrapper, errorWrapperSync, TemplaterError } from "Error";
import { Editor } from 'editor/Editor';
import { Parser } from 'parser/Parser';
import { log_error } from 'Log';

export enum RunMode {
    CreateNewFromTemplate,
    AppendActiveFile,
    OverwriteFile,
    OverwriteActiveFile,
    DynamicProcessor,
    StartupTemplate,
};

export interface RunningConfig {
    template_file: TFile,
    target_file: TFile,
    run_mode: RunMode,
    active_file?: TFile,
};

export class Templater {
    public parser: Parser;
    public functions_generator: FunctionsGenerator;
	public editor: Editor;
    public current_functions_object: {};

    constructor(private app: App, private plugin: TemplaterPlugin) {
		this.functions_generator = new FunctionsGenerator(this.app, this.plugin);
		this.editor = new Editor(this.app, this.plugin);
        this.parser = new Parser();
    }

    async setup() {
		await this.editor.setup();
        await this.functions_generator.init();
		this.plugin.registerMarkdownPostProcessor((el, ctx) => this.process_dynamic_templates(el, ctx));
    }

    create_running_config(template_file: TFile, target_file: TFile, run_mode: RunMode) {
       const active_file = this.app.workspace.getActiveFile();

        return {
            template_file: template_file,
            target_file: target_file,
            run_mode: run_mode,
            active_file: active_file,
        };
    }

    async read_and_parse_template(config: RunningConfig): Promise<string> {
        const template_content = await this.app.vault.read(config.template_file);
        return this.parse_template(config, template_content);
    }

    async parse_template(config: RunningConfig, template_content: string): Promise <string> {
        const functions_object = await this.functions_generator.generate_object(config, FunctionsMode.USER_INTERNAL);
        this.current_functions_object = functions_object;
        const content = await this.parser.parse_commands(template_content, functions_object);
        return content;
    }

    async create_new_note_from_template(template: TFile | string, folder?: TFolder, filename?: string, open_new_note: boolean = true): Promise<TFile> {

        // TODO: Maybe there is an obsidian API function for that
        if (!folder) {
            // TODO: Fix that
            // @ts-ignore
            const new_file_location = this.app.vault.getConfig("newFileLocation");
            switch (new_file_location) {
                case "current":
                    const active_file = this.app.workspace.getActiveFile();
                    if (active_file) {
                        folder = active_file.parent; 
                    }
                    break;
                case "folder":
                    folder = this.app.fileManager.getNewFileParent("");
                    break;
                case "root":
                    folder = this.app.vault.getRoot();
                    break;
                default:
                    break;
            }
        }

        // TODO: Change that, not stable atm
        // @ts-ignore
        const created_note = await this.app.fileManager.createNewMarkdownFile(folder, filename ?? "Untitled");

        let running_config: RunningConfig;
        let output_content: string;
        if (template instanceof TFile) {
            running_config = this.create_running_config(template, created_note, RunMode.CreateNewFromTemplate);
            output_content = await errorWrapper(async () => this.read_and_parse_template(running_config), "Template parsing error, aborting.");
        } else {
            running_config = this.create_running_config(undefined, created_note, RunMode.CreateNewFromTemplate);
            output_content = await errorWrapper(async () => this.parse_template(running_config, template), "Template parsing error, aborting.");
        }

        if (output_content == null) {
            await this.app.vault.delete(created_note);
            return;
        }

        await this.app.vault.modify(created_note, output_content);

        if (open_new_note) {
            const active_leaf = this.app.workspace.activeLeaf;
            if (!active_leaf) {
                log_error(new TemplaterError("No active leaf"));
                return;
            }
            await active_leaf.openFile(created_note, {state: {mode: 'source'}, eState: {rename: 'all'}});
            await this.editor.jump_to_next_cursor_location();
        }

        return created_note;
    }

    async append_template_to_active_file(template_file: TFile): Promise<void> {
        const active_view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (active_view === null) {
            log_error(new TemplaterError("No active view, can't append templates."));
            return;
        }
        const running_config = this.create_running_config(template_file, active_view.file, RunMode.AppendActiveFile);
        const output_content = await errorWrapper(async () => this.read_and_parse_template(running_config), "Template parsing error, aborting.");
        // errorWrapper failed 
        if (output_content == null) {
            return;
        }

        const editor = active_view.editor;
        const doc = editor.getDoc();
        doc.replaceSelection(output_content);

        // TODO: Remove this
        await this.editor.jump_to_next_cursor_location();
    }

    async write_template_to_file(template_file: TFile, file: TFile) {
        const running_config = this.create_running_config(template_file, file, RunMode.OverwriteFile);
        const output_content = await errorWrapper(async () => this.read_and_parse_template(running_config), "Template parsing error, aborting.");
        // errorWrapper failed 
        if (output_content == null) {
            return;
        }
        await this.app.vault.modify(file, output_content);
    }

    overwrite_active_file_commands(): void {
        const active_view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (active_view === null) {
			log_error(new TemplaterError("Active view is null, can't overwrite content"));
            return;
        }
        this.overwrite_file_commands(active_view.file, true);
	}

    async overwrite_file_commands(file: TFile, active_file: boolean = false): Promise<void> {
        const running_config = this.create_running_config(file, file, active_file ? RunMode.OverwriteActiveFile : RunMode.OverwriteFile);
        const output_content = await errorWrapper(async () => this.read_and_parse_template(running_config), "Template parsing error, aborting.");
        // errorWrapper failed 
        if (output_content == null) {
            return;
        }
        await this.app.vault.modify(file, output_content);
        // TODO: Remove this
        if (this.app.workspace.getActiveFile() === file) {
            await this.editor.jump_to_next_cursor_location();
        }
    }

    async process_dynamic_templates(el: HTMLElement, ctx: MarkdownPostProcessorContext): Promise<void> {
        const dynamic_command_regex: RegExp = /(<%(?:-|_)?\s*[*~]{0,1})\+((?:.|\s)*?%>)/g;

        const walker = document.createNodeIterator(el, NodeFilter.SHOW_TEXT);
        let node;
        let pass = false;
        let functions_object: {};
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
                    const config = this.create_running_config(file, file, RunMode.DynamicProcessor);
                    functions_object = await this.functions_generator.generate_object(config, FunctionsMode.USER_INTERNAL);
                    this.current_functions_object = functions_object;
                }

                while (match != null) {
                    // Not the most efficient way to exclude the '+' from the command but I couldn't find something better
                    const complete_command = match[1] + match[2];
                    const command_output: string = await errorWrapper(async () => {
                        return await this.parser.parse_commands(complete_command, functions_object);
                    }, `Command Parsing error in dynamic command '${complete_command}'`);
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

    get_new_file_template_for_folder(folder: TFolder): undefined | string {
        let match = this.plugin.settings.new_file_templates.find(e => e[0] == folder.path);

        if (folder.isRoot()) {
            return match ? match[1] : undefined;
        } else {
            return match ? match[1] : undefined || this.get_new_file_template_for_folder(folder.parent);
        }
    }

    static async on_file_creation(templater: Templater, file: TAbstractFile) {
        if (!(file instanceof TFile) || file.extension !== "md") {
            return;
        }

        // Avoids template replacement when syncing template files
        const template_folder = normalizePath(templater.plugin.settings.templates_folder);
        if (file.path.includes(template_folder) && template_folder !== "/") {
            return;
        }

        // TODO: find a better way to do this
        // Currently, I have to wait for the daily note plugin to add the file content before replacing
        // Not a problem with Calendar however since it creates the file with the existing content
        await delay(300);

        if (file.stat.size == 0 && templater.plugin.settings.use_new_file_templates) {
            const folder_template_match = templater.get_new_file_template_for_folder(file.parent);

            const template_file: TFile = await errorWrapper(async (): Promise<TFile> => {
                if (folder_template_match) {
                    return resolve_tfile(templater.app, folder_template_match);
                }
            }, `Couldn't find template ${folder_template_match}`);
            // errorWrapper failed
            if (template_file == null) {
                return;
            }
            await templater.write_template_to_file(template_file, file);
        } else {
            await templater.overwrite_file_commands(file);
        }
    }

    async execute_startup_scripts() {
        for (const template of this.plugin.settings.startup_templates) {
            if (!template) {
                continue;
            }
            const file = errorWrapperSync(() => resolve_tfile(this.app, template), `Couldn't find startup template "${template}"`);
            if (!file) {
                continue;
            }
            const running_config = this.create_running_config(file, file, RunMode.StartupTemplate);
            await errorWrapper(async () => this.read_and_parse_template(running_config), `Startup Template parsing error, aborting.`);
        }
    }
}
