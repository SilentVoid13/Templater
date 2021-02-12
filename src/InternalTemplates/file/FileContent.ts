import { MarkdownView } from "obsidian";
import { InternalTemplateFile } from "./InternalTemplateFile";

export class FileContent extends InternalTemplateFile {
    async render() {    
        let active_view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (active_view == null) {
            throw new Error("Active view is null");
        }
        return active_view.data;
    }
}