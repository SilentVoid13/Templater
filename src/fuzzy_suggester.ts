import { App, FileSystemAdapter, FuzzySuggestModal, MarkdownView, Notice, TAbstractFile, TFile } from "obsidian";
import { exec } from 'child_process';
import { promisify } from "util";

import { replace_internal_command_templates } from './internal_command_templates';
import { replace_internal_templates } from "./internal_templates";
import TemplaterPlugin from './main';

const exec_promise = promisify(exec);

export class TemplaterFuzzySuggestModal extends FuzzySuggestModal<TFile> {
    app: App;
    plugin: TemplaterPlugin;
    cwd: string;

    constructor(app: App, plugin: TemplaterPlugin) {
        super(app);
        this.app = app;
        this.plugin = plugin;

        if (!(this.app.vault.adapter instanceof FileSystemAdapter)) {
            this.cwd = "";
        }
        else {
            this.cwd = this.app.vault.adapter.getBasePath();
        }
    }

    getItems(): TFile[] {
        let template_files: TFile[] = [];

        if (this.plugin.settings.template_folder === "") {
            let files = this.app.vault.getFiles();
            template_files = files;
        }
        else {
            let settings_folder = this.plugin.settings.template_folder;

            if (this.plugin.settings.template_folder.endsWith("/")) {
                settings_folder = this.plugin.settings.template_folder.slice(0, -1);
            }

            let abstract_files = this.app.vault.getAbstractFileByPath(settings_folder);
            if (!abstract_files) {
                throw new Error(settings_folder + " folder doesn't exist");
            }
            template_files = this.get_all_files_from(abstract_files);
        }

        return template_files;
    }

    getItemText(item: TFile): string {
        return item.basename;
    }

    onChooseItem(item: TFile, _evt: MouseEvent | KeyboardEvent): void {
       this.replace_templates_and_append(item);
    }

    start(): void {
        try {
            let files = this.getItems();
            if (files.length == 1) {
                this.replace_templates_and_append(files[0]);
            }
            else {
                this.open();
            }
        }
        catch(error) {
            new Notice(error);
        }
    }

    async replace_templates_and_append(template_file: TFile) {
        let active_view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (active_view == null) {
            return;
        }

        let editor = active_view.sourceMode.cmEditor;
        let doc = editor.getDoc();

        let content = await this.app.vault.read(template_file);
        content = await this.replace_templates(content);

        doc.replaceSelection(content);
        editor.focus();
    }

    async replace_templates_and_overwrite_in_file(file: TFile) {
        let content = await this.app.vault.read(file);
        content = await this.replace_templates(content);
        await this.app.vault.modify(file, content);
    }

    async replace_templates(content: string) {
        // User defined templates
        for (let i = 0; i < this.plugin.settings.templates_pairs.length; i++) {
            let template_pair = this.plugin.settings.templates_pairs[i];
            let template = template_pair[0];
            let cmd = template_pair[1];
            if (template === "" || cmd === "") {
                continue;
            }
            cmd = await replace_internal_command_templates(this.app, cmd);

            if (content.contains(template)) {
                try {
                    // 80 97 114 105 115 58 32 9925 65039 32 32 43 54 176 67 10 
                    let {stdout, stderr} = await exec_promise(cmd, {
                        timeout: this.plugin.settings.command_timeout*1000,
                        cwd: this.cwd
                    });
                    
                    let a = "";
                    for (let i = 0; i < stdout.length; i++) {
                        a += stdout.charCodeAt(i) + " ";
                    }
                    
                    content = content.replace(
                        new RegExp(template, "g"), 
                        stdout.trim()
                    );
                }
                catch(error) {
                    console.log(`Error with the template n° ${(i+1)}:\n`, error);
                    new Notice("Error with the template n°" + (i+1) + " (check console for more informations)");
                }
            }
        }

        // Internal templates
        content = await replace_internal_templates(this.app, content);
        
        return content;
    }

    get_all_files_from(file: TAbstractFile) {
        let files: Array<TFile> = [];
        for (let f of file.children) {
            if (f instanceof TFile) {
                files.push(f);
            }
            else {
                files = files.concat(this.get_all_files_from(f));
            }
        }
        return files;
    }
}
