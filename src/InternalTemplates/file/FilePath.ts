import { FileSystemAdapter, MarkdownView } from "obsidian";
import { InternalTemplateFile } from "./InternalTemplateFile";

export class FilePath extends InternalTemplateFile {
    async render() {    
        let active_view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (active_view == null) {
            throw new Error("Active view is null");
        }
        let file = active_view.file;
        
        if (!(this.app.vault.adapter instanceof FileSystemAdapter)) {
            throw new Error("app.vault is not a FileSystemAdapter instance");
        }
        let vault_path = this.app.vault.adapter.getBasePath();

        if (this.relative !== "false") {
            return file.path;
        }
        else {
            return `${vault_path}/${file.path}`;
        }
    }
}