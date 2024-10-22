import { TemplaterError } from "./Error";
import {
    App,
    normalizePath,
    TAbstractFile,
    TFile,
    TFolder,
    Vault,
} from "obsidian";

export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function escape_RegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export function generate_command_regex(): RegExp {
    return /<%(?:-|_)?\s*[*~]{0,1}((?:.|\s)*?)(?:-|_)?%>/g;
}

export function generate_dynamic_command_regex(): RegExp {
    return /(<%(?:-|_)?\s*[*~]{0,1})\+((?:.|\s)*?%>)/g;
}

export function resolve_tfolder(app: App, folder_str: string): TFolder {
    folder_str = normalizePath(folder_str);

    const folder = app.vault.getAbstractFileByPath(folder_str);
    if (!folder) {
        throw new TemplaterError(`Folder "${folder_str}" doesn't exist`);
    }
    if (!(folder instanceof TFolder)) {
        throw new TemplaterError(`${folder_str} is a file, not a folder`);
    }

    return folder;
}

export function resolve_tfile(app: App, file_str: string): TFile {
    file_str = normalizePath(file_str);

    const file = app.vault.getAbstractFileByPath(file_str);
    if (!file) {
        throw new TemplaterError(`File "${file_str}" doesn't exist`);
    }
    if (!(file instanceof TFile)) {
        throw new TemplaterError(`${file_str} is a folder, not a file`);
    }

    return file;
}

export function get_tfiles_from_folder(
    app: App,
    folder_str: string
): Array<TFile> {
    const folder = resolve_tfolder(app, folder_str);

    const files: Array<TFile> = [];
    Vault.recurseChildren(folder, (file: TAbstractFile) => {
        if (file instanceof TFile) {
            files.push(file);
        }
    });

    files.sort((a, b) => {
        return a.path.localeCompare(b.path);
    });

    return files;
}

export function arraymove<T>(
    arr: T[],
    fromIndex: number,
    toIndex: number
): void {
    if (toIndex < 0 || toIndex === arr.length) {
        return;
    }
    const element = arr[fromIndex];
    arr[fromIndex] = arr[toIndex];
    arr[toIndex] = element;
}

export function get_active_file(app: App) {
    return app.workspace.activeEditor?.file ?? app.workspace.getActiveFile();
}

/**
 * @param path Normalized file path
 * @returns Folder path
 * @example
 * get_folder_path_from_path(normalizePath("path/to/folder/file", "md")) // path/to/folder
 */
export function get_folder_path_from_file_path(path: string) {
    const path_separator = path.lastIndexOf("/");
    if (path_separator !== -1) return path.slice(0, path_separator);
    return "";
}

export function is_object(obj: unknown): obj is Record<string, unknown> {
    return obj !== null && typeof obj === "object";
}

export function get_fn_params(func: (...args: unknown[]) => unknown) {
    const str = func.toString();
    const len = str.indexOf("(");
    return str
        .substring(len + 1, str.indexOf(")"))
        .replace(/ /g, "")
        .split(",");
}
