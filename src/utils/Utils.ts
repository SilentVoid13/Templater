import { DocBlock, DocNode, DocParamBlock, DocParamCollection, DocPlainText, DocSection, ParserContext, TSDocParser } from "@microsoft/tsdoc";

import { TJDocFile, TJDocFileArgument } from "./TJDocFile";

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

export async function populate_docs_from_user_scripts(
    app: App,
    files: Array<TFile>
): Promise<TJDocFile[]> {
    const docFiles = await Promise.all(
        files.map(async (file) => {
            // Get file contents
            const content = await app.vault.cachedRead(file);

            const newDocFile = generate_jsdoc(file, content);

            return newDocFile;
        })
    );

    return docFiles;
}

function generate_jsdoc(file: TFile, content: string): TJDocFile {
    // Parse the content
    const tsdocParser = new TSDocParser();
    const parsedDoc = tsdocParser.parseString(content);

    // Copy and extract information into the TJDocFile
    const newDocFile = new TJDocFile(file);

    newDocFile.description = generate_jsdoc_description(
        parsedDoc.docComment.summarySection
    );
    newDocFile.returns = generate_jsdoc_return(
        parsedDoc.docComment.returnsBlock
    );
    newDocFile.arguments = generate_jsdoc_arguments(
        parsedDoc.docComment.params
    );

    return newDocFile;
}

function generate_jsdoc_description(summarySection: DocSection): string {
    try {
        const description = summarySection.nodes.map((node: DocNode) =>
            node
                .getChildNodes()
                .filter((node: DocNode) => node instanceof DocPlainText)
                .map((x: DocPlainText) => x.text)
                .join("\n")
        );

        return description.join("\n");
    } catch (error) {
        console.error("Failed to parse summary section");
    }
}

function generate_jsdoc_return(returnSection: DocBlock | undefined): string {
    if (!returnSection) return "";

    try {
        const returnValue = returnSection.content.nodes[0]
            .getChildNodes()[0]
            .text.trim();
        return returnValue;
    } catch (error) {
        return "";
    }
}

function generate_jsdoc_arguments(
    paramSection: DocParamCollection
): TJDocFileArgument[] {
    try {
        const blocks = paramSection.blocks;
        const args = blocks.map((block) => {
            const name = block.parameterName;
            const description = block.content
                .getChildNodes()[0]
                .getChildNodes()
                .filter((x) => x instanceof DocPlainText)
                .map((x) => x.text)
                .join(" ");
            return new TJDocFileArgument(name, description);
        });

        return args;
    } catch (error) {
        return [];
    }
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

/**
 * Use a parent HtmlElement to create a label with a value
 * @param parent The parent HtmlElement; Use HtmlOListElement to return a `li` element
 * @param title The title for the label which will be bolded
 * @param value The value of the label
 * @returns A label HtmlElement (p | li)
 */
export function append_bolded_label_with_value_to_parent(
    parent: HTMLElement,
    title: string,
    value: string
): HTMLElement {
    const tag = parent instanceof HTMLOListElement ? "li" : "p";

    const para = parent.createEl(tag);
    const bold = parent.createEl("b", { text: title });
    para.appendChild(bold);
    para.appendChild(document.createTextNode(`: ${value}`));

    // Returns a p or li element
    // Resulting in <b>Title</b>: value
    return para;
}

export async function merge_front_matter(
    app: App,
    file: TFile | null,
    properties: Record<string, unknown>
): Promise<void> {
    if (!file) {
        return;
    }
    try {
        for (const prop of Object.keys(properties)) {
            const value = properties[prop];
            if (app.metadataCache.getFileCache(file)?.frontmatter == null) {
                console.log("Frontmatter is empty");
                await app.fileManager.processFrontMatter(
                    file,
                    (frontmatter) => {
                        console.log(
                            `adding new property: ${prop} to ${file.basename} with value: ${value}`
                        );
                        frontmatter[prop] = value;
                    }
                );
            } else if (
                app.metadataCache
                    .getFileCache(file)
                    ?.frontmatter?.hasOwnProperty(prop)
            ) {
                console.log(`${file.basename} contains property: ${prop}`);
                const originalValue =
                    app.metadataCache.getFileCache(file)?.frontmatter?.[
                        prop
                    ];
                if (
                    value != null &&
                    (Array.isArray(originalValue) || Array.isArray(value))
                ) {
                    console.log(`${prop} is an array`);
                    await app.fileManager.processFrontMatter(
                        file,
                        (frontmatter) => {
                            if (!Array.isArray(originalValue)) {
                                console.log(
                                    `converting ${prop} to an array in ${file.basename}`
                                );
                                frontmatter[prop] = [originalValue];
                            }
                            if (Array.isArray(value)) {
                                for (let i = 0; i < value.length; i++) {
                                    console.log(
                                        `adding ${value[i]} to ${prop} in ${file.basename}`
                                    );
                                    if (
                                        !frontmatter[prop].includes(
                                            value[i]
                                        )
                                    ) {
                                        frontmatter[prop].push(value[i]);
                                    }
                                }
                            } else {
                                console.log(
                                    `adding ${value} to ${prop} in ${file.basename}`
                                );
                                if (!frontmatter[prop].includes(value)) {
                                    frontmatter[prop].push(value);
                                }
                            }
                        }
                    );
                } else if (originalValue !== value && value != null) {
                    console.log(
                        `updating property: ${prop} in ${file.basename} from ${originalValue} to ${value}`
                    );
                    await app.fileManager.processFrontMatter(
                        file,
                        (frontmatter) => {
                            frontmatter[prop] = value;
                        }
                    );
                }
            } else {
                    console.log(`${file.basename} doesn't contain ${prop}`);
                    console.log(
                        `adding property: ${prop} to ${file.basename} with value: ${value}`
                    );
                    await app.fileManager.processFrontMatter(
                        file,
                        (frontmatter) => {
                            frontmatter[prop] = value;
                        }
                    );
                }
            })
        );
    } catch (error) {
        console.error("Error in processing frontmatter: ", error);
    }
}
  