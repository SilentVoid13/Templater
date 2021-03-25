import { App, EditorPosition, MarkdownView, TFile } from "obsidian";
import { InternalTemplateParser } from "./InternalTemplates/InternalTemplateParser";
import TemplaterPlugin from "./main";
import { UserTemplateParser } from "./UserTemplates/UserTemplateParser";

const TP_CURSOR = "{{tp.cursor}}";

export class TemplateParser {
    public internalTemplateParser: InternalTemplateParser;
	public userTemplateParser: UserTemplateParser;
    
    constructor(private app: App, plugin: TemplaterPlugin) {
        this.internalTemplateParser = new InternalTemplateParser(this.app);
        this.userTemplateParser = UserTemplateParser.createUserTemplateParser(this.app, plugin, this.internalTemplateParser);
    }

    async replace_templates(content: string, file: TFile) {
        content = await this.internalTemplateParser.parseTemplates(content, file);
        if (this.userTemplateParser) {
            content = await this.userTemplateParser.parseTemplates(content, file);        
        }
        return content;
    }

    async replace_templates_and_append(template_file: TFile) {
        let active_view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (active_view == null) {
            throw new Error("Templater: no active view, can't append templates.");
        }

        let editor = active_view.editor
        let doc = editor.getDoc();

        let content = await this.app.vault.read(template_file);
        content = await this.replace_templates(content, active_view.file);
        
        let rel_pos = await this.get_cursor_location(content);
        if (rel_pos) {
            content = content.replace(new RegExp(TP_CURSOR, "g"), "");
        }
        let current_pos = doc.getCursor();

        doc.replaceSelection(content);

        if (rel_pos) {
            if (rel_pos.line == 0) {
                rel_pos.ch += current_pos.ch;
            }
            rel_pos.line += current_pos.line;
            await this.set_cursor_location(rel_pos);
        }
        editor.focus();
    }

    async replace_templates_and_overwrite_in_file(file: TFile) {
        let content = await this.app.vault.read(file);

        let new_content = await this.replace_templates(content, file);
        if (new_content !== content) {
            let pos = await this.get_cursor_location(new_content);
            if (pos) {
                new_content = new_content.replace(new RegExp(TP_CURSOR, "g"), "");
            }

            await this.app.vault.modify(file, new_content);
            
            if (pos) {
                await this.set_cursor_location(pos);
            }
        }
    }

    async get_cursor_location(content: string) {
        let pos: EditorPosition = null;
        let index = content.indexOf(TP_CURSOR)
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

    async set_cursor_location(pos: EditorPosition) {
        if (Object.keys(pos).length === 0) {
            return;
        }

        let active_view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (active_view == null) {
            return;
        }
        let editor = active_view.editor;

        editor.focus();
        // TODO: Replace with setCursor in next release
        editor.setSelection(pos);
    }
}