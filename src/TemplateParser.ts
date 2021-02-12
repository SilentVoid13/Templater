import { App, MarkdownView, TFile } from "obsidian";
import { InternalTemplateParser } from "./InternalTemplates/InternalTemplateParser";
import TemplaterPlugin from "./main";
import { UserTemplateParser } from "./UserTemplates/UserTemplateParser";

const TP_CURSOR = "{{tp.cursor}}";

export class TemplateParser {
    public internalTemplateParser: InternalTemplateParser;
	public userTemplateParser: UserTemplateParser;
    
    constructor(private app: App, plugin: TemplaterPlugin) {
        this.internalTemplateParser = new InternalTemplateParser(this.app);
        this.userTemplateParser = new UserTemplateParser(this.app, plugin, this.internalTemplateParser);
    }

    async replace_templates(content: string) {
        content = await this.internalTemplateParser.parseTemplates(content);
        content = await this.userTemplateParser.parseTemplates(content);        
        return content;
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
            content = content.replace(new RegExp(TP_CURSOR, "g"), "");
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
                new_content = new_content.replace(new RegExp(TP_CURSOR, "g"), "");
            }

            await this.app.vault.modify(file, new_content);
            
            if (pos.length !== 0) {
                await this.set_cursor_location(pos);
            }
        }
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