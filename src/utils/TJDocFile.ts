import type { FileStats, TFolder, Vault } from "obsidian";
import type { TFile } from "obsidian";

// Plain data class — does NOT extend TFile to avoid calling Obsidian's
// TAbstractFile constructor without a valid path, which crashes with
// "Cannot read properties of undefined (reading 'lastIndexOf')".
export class TJDocFile {
    vault: Vault;
    path: string;
    name: string;
    parent: TFolder;
    stat: FileStats;
    basename: string;
    extension: string;
    public description: string;
    public returns: string;
    public arguments: TJDocFileArgument[];

    constructor(file: TFile) {
        Object.assign(this, file);
    }
}

export class TJDocFileArgument {
    public name: string;
    public description: string;
    constructor(name: string, desc: string) {
        this.name = name;
        this.description = desc;
    }
}
