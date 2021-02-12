import { normalizePath, TFile } from "obsidian";
import { InternalTemplateFile } from "./InternalTemplateFile";

export class FileInclude extends InternalTemplateFile {
    async render() {    
        let file = this.app.metadataCache.getFirstLinkpathDest(normalizePath(this.file), "");
        if (!file) {
            throw new Error(`File ${this.file} passed to tp_include doesn't exist`);
        }
        if (!(file instanceof TFile)) {
            throw new Error(`tp_include: ${this.file} is a folder, not a file`);
        }

        let content = await this.app.vault.read(file);
    
        return content;
    }
}