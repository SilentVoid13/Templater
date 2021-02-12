import { MarkdownView } from "obsidian";
import { InternalTemplateFile } from "./InternalTemplateFile";

export class FileSelection extends InternalTemplateFile {
    async render() {    
        let active_view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (active_view == null) {
            throw new Error("Active view is null");
        }

        let editor = active_view.sourceMode.cmEditor;
        return editor.getSelection();
    }
}