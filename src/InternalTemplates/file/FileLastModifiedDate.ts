import { MarkdownView } from "obsidian";
import { get_date_string } from "../InternalUtils";
import { InternalTemplateFile } from "./InternalTemplateFile";

export class FileLastModifiedDate extends InternalTemplateFile {
    async render() {    
        let active_view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (active_view === null) {
            throw new Error("Active view is null");
        }

        let modif_date = get_date_string(this.format, undefined, active_view.file.stat.mtime);
        return modif_date;
    }
}