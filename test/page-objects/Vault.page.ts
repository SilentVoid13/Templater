import { obsidianPage } from "wdio-obsidian-service";

class Vault {
    async expectFileToHaveContent(filePath: string, expectedContent: string) {
        return browser.waitUntil(async () => {
            const content = await obsidianPage.read(filePath);
            return content === expectedContent;
        });
    }

    async expectFileToNotExist(filePath: string): Promise<void> {
        await browser.waitUntil(async () => {
            const result = await browser.executeObsidian(
                ({ app }, path: string) => app.vault.getFileByPath(path) === null,
                filePath,
            );
            return Boolean(result);
        });
    }
}

export default new Vault();
