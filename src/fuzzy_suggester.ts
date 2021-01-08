import { App, FileSystemAdapter, FuzzySuggestModal, MarkdownView, Notice, TFile, TFolder, normalizePath } from "obsidian";
import { exec } from 'child_process';
import { promisify } from "util";

import { replace_internal_command_templates } from './internal_command_templates';
import { replace_internal_templates } from "./internal_templates";
import TemplaterPlugin from './main';
import { TP_CURSOR } from "./constants";

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
            let settings_folder = normalizePath(this.plugin.settings.template_folder);

            let abstract_files = this.app.vault.getAbstractFileByPath(settings_folder);
            if (!abstract_files) {
                throw new Error(settings_folder + " folder doesn't exist");
            }
            if (! (abstract_files instanceof TFolder)) {
                throw new Error(settings_folder + " is a file, not a folder");
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
        
        let rel_pos = await this.get_cursor_location(content);
        if (rel_pos.length !== 0) {
            content = content.replace(new RegExp(TP_CURSOR), "");
        }
        let current_pos = doc.getCursor();

        doc.replaceSelection(content);

        if (rel_pos.length !== 0) {
            if (rel_pos[0] == 0) {
                rel_pos[1] += current_pos["ch"];
            }
            rel_pos[0] += current_pos["line"];
            await this.set_cursor_location(rel_pos);
        }
        editor.focus();
    }

    async replace_templates_and_overwrite_in_file(file: TFile) {
        let content = await this.app.vault.read(file);

        let new_content = await this.replace_templates(content);
        if (new_content !== content) {
            let pos = await this.get_cursor_location(new_content);
            if (pos.length !== 0) {
                new_content = new_content.replace(new RegExp(TP_CURSOR), "");
            }

            await this.app.vault.modify(file, new_content);
            
            if (pos.length !== 0) {
                await this.set_cursor_location(pos);
            }
        }
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
                    let {stdout, stderr} = await exec_promise(cmd, {
                        timeout: this.plugin.settings.command_timeout*1000,
                        cwd: this.cwd
                    });
                    
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

    get_all_files_from(file: TFolder) {
        let files: Array<TFile> = [];
        for (let f of file.children) {
            if (f instanceof TFile) {
                files.push(f);
            }
            else {
                if (f instanceof TFolder) {
                    files = files.concat(this.get_all_files_from(f));
                }
                else {
                    throw new Error("Unknown TAbstractFile type");
                }
            }
        }
        return files;
    }

    async get_cursor_location(content: string) {
        let pos = Array();
        let index = content.indexOf(TP_CURSOR)
        if (index !== -1) {
            let substr = content.substr(0, index);

            let l = 0;
            let offset = -1;
            let r = -1;
            for (; (r = substr.indexOf("\n", r+1)) !== -1 ; l++, offset=r);
            offset += 1;

            let ch = content.substr(offset, index-offset).length;
            pos = [l, ch];
        }
        return pos;
    }

    async set_cursor_location(pos: Array<number>) {
        if (Object.keys(pos).length === 0) {
            return;
        }

        let active_view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (active_view == null) {
            return;
        }
        let editor = active_view.sourceMode.cmEditor;

        editor.focus();
        editor.setCursor({line: pos[0], ch: pos[1]});
    }
}
