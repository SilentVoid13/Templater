import { browser } from "@wdio/globals";
import { obsidianPage } from "wdio-obsidian-service";
import { Key } from "webdriverio";

export async function resetWorkspace(): Promise<void> {
    await browser.keys(Key.Escape);
    await obsidianPage.loadWorkspaceLayout("empty");
}

export async function isTemplaterLoaded(): Promise<boolean> {
    return browser.executeObsidian(({ app }) => {
        return !!app.plugins.getPlugin("templater-obsidian");
    });
}

export async function writeVaultFile(
    filePath: string,
    content: string,
): Promise<void> {
    await browser.executeObsidian(
        async ({ app }, payload: { filePath: string; content: string }) => {
            const existingFile = app.vault.getFileByPath(payload.filePath);
            if (existingFile) {
                await app.vault.modify(existingFile, payload.content);
                return;
            }
            await app.vault.create(payload.filePath, payload.content);
        },
        { filePath, content },
    );
}

export async function readVaultFile(filePath: string): Promise<string> {
    return browser.executeObsidian(async ({ app }, targetPath: string) => {
        const file = app.vault.getFileByPath(targetPath);
        if (!file) {
            throw new Error(`File not found: ${targetPath}`);
        }
        return app.vault.read(file);
    }, filePath);
}
