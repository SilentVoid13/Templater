import { obsidianPage } from "wdio-obsidian-service";

class Vault {
    async createFile(filePath: string, content: string): Promise<void> {
        await browser.executeObsidian(
            async ({ app }, path: string, data: string) => {
                const parent = path.split("/").slice(0, -1).join("/");
                if (parent && !app.vault.getFolderByPath(parent)) {
                    await app.vault.createFolder(parent);
                }
                await app.vault.create(path, data);
            },
            filePath,
            content,
        );
    }

    async expectFileToHaveContent(
        filePath: string,
        expectedContent: string | RegExp,
    ) {
        return browser.waitUntil(async () => {
            const content = await obsidianPage.read(filePath);
            return expectedContent instanceof RegExp
                ? expectedContent.test(content)
                : content === expectedContent;
        });
    }

    async expectFileToNotExist(filePath: string): Promise<void> {
        await browser.waitUntil(async () => {
            const result = await browser.executeObsidian(
                ({ app }, path: string) =>
                    app.vault.getFileByPath(path) === null,
                filePath,
            );
            return Boolean(result);
        });
    }
}

export default new Vault();
