import { obsidianPage } from "wdio-obsidian-service";

class Vault {
    async expectFileToHaveContent(filePath: string, expectedContent: string) {
        return browser.waitUntil(async () => {
            const content = await obsidianPage.read(filePath);
            return content === expectedContent;
        });
    }
}

export default new Vault();
