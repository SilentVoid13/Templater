import { MarkdownView } from "obsidian";
import { InternalTemplateFile } from "./InternalTemplateFile";

export class FileFolder extends InternalTemplateFile {
    async render() {    
        let active_view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (active_view == null) {
            throw new Error("Active view is null");
        }
        let parent = active_view.file.parent;
        let folder;

        if (this.relative !== "false") {
            folder = parent.path;
        }
        else {
            folder = parent.name;
        }

        return folder;
    }
}