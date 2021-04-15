import { App, normalizePath, TAbstractFile, TFile, TFolder, Vault } from "obsidian";

export function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
};

export function escapeRegExp(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export function getTFilesFromFolder(app: App, folder_str: string): Array<TFile> {
    folder_str = normalizePath(folder_str);

    let folder = app.vault.getAbstractFileByPath(folder_str);
    if (!folder) {
        throw new Error(`${folder_str} folder doesn't exist`);
    }
    if (!(folder instanceof TFolder)) {
        throw new Error(`${folder_str} is a file, not a folder`);
    }

    let files: Array<TFile> = [];
    Vault.recurseChildren(folder, (file: TAbstractFile) => {
        if (file instanceof TFile) {
            files.push(file);
        }
    });

    files.sort((a, b) => {
        return a.basename.localeCompare(b.basename);
    });

    return files;
}