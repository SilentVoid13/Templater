import { browser } from "@wdio/globals";
import type { TFile } from "obsidian";

export interface CreatedTemplaterNote {
    name: string;
    path: string;
    content: string;
}

interface CreateNewNoteFromTemplateInput {
    templateContent: string;
    filename: string;
    folderPath?: string;
    templatePath?: string;
    useTemplateFile: boolean;
    openNewNote?: boolean;
}

export function uniqueTestName(prefix: string): string {
    const randomSuffix = Math.random().toString(36).slice(2, 8);
    return `${prefix}-${Date.now()}-${randomSuffix}`;
}

export async function createNewNoteFromTemplate(
    input: CreateNewNoteFromTemplateInput,
): Promise<CreatedTemplaterNote | null> {
    return browser.executeObsidian(
        async ({ app }, payload: CreateNewNoteFromTemplateInput) => {
            const plugin = app.plugins.getPlugin("templater-obsidian");

            if (!plugin) {
                throw new Error("templater-obsidian is not loaded");
            }

            let template: string | TFile = payload.templateContent;

            if (payload.useTemplateFile) {
                const templatePath =
                    payload.templatePath ?? `${payload.filename}-template.md`;
                const existingTemplate = app.vault.getFileByPath(templatePath);
                if (existingTemplate) {
                    await app.vault.modify(
                        existingTemplate,
                        payload.templateContent,
                    );
                    template = existingTemplate;
                } else {
                    template = await app.vault.create(
                        templatePath,
                        payload.templateContent,
                    );
                }
            }

            const created =
                await plugin.templater.create_new_note_from_template(
                    template,
                    payload.folderPath,
                    payload.filename,
                    payload.openNewNote ?? false,
                );

            if (!created) {
                return null;
            }

            const createdFile = app.vault.getFileByPath(created.path);
            if (!createdFile) {
                throw new Error(`Created note is missing: ${created.path}`);
            }

            const content = await app.vault.read(createdFile);
            return {
                name: created.name,
                path: created.path,
                content,
            };
        },
        input,
    );
}

export async function deleteVaultPath(targetPath: string): Promise<void> {
    await browser.executeObsidian(async ({ app }, pathToDelete: string) => {
        const target = app.vault.getAbstractFileByPath(pathToDelete);
        if (target) {
            await app.vault.delete(target, true);
        }
    }, targetPath);
}
