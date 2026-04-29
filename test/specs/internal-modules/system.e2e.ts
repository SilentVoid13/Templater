import { resetWorkspace } from "../../helpers/obsidianTestHelpers";
import {
    deleteVaultPath,
    runAndGetOutput,
    setClipboardText,
    uniqueTestName,
} from "../../helpers/legacyTemplaterTestHelpers";

describe("InternalModuleSystem", () => {
    const cleanupPaths: string[] = [];

    beforeEach(async () => {
        cleanupPaths.length = 0;
        await resetWorkspace();
    });

    afterEach(async () => {
        for (const path of cleanupPaths.reverse()) {
            await deleteVaultPath(path);
        }
    });

    it("tp.system.clipboard", async () => {
        const baseName = uniqueTestName("wdio-system");
        const targetPath = `${baseName}-target.md`;
        const templatePath = `${baseName}-template.md`;
        cleanupPaths.push(targetPath, templatePath);

        const clipboardContent = "This some test\n\ncontent\n\n";
        await setClipboardText(clipboardContent);

        const output = await runAndGetOutput({
            templatePath,
            targetPath,
            templateContent: "Clipboard content: <% tp.system.clipboard() %>",
            targetContent: "",
        });

        expect(output).toBe(`Clipboard content: ${clipboardContent}`);
    });

    it.skip("tp.system.prompt", async () => {
        // Legacy test is TODO.
    });

    it.skip("tp.system.suggester", async () => {
        // Legacy test is TODO.
    });
});
