import { resetWorkspace } from "../../helpers/obsidianTestHelpers";
import {
    arePropertiesVisible,
    deleteVaultPath,
    runInNewLeafAndGetOutput,
    uniqueTestName,
} from "../../helpers/legacyTemplaterTestHelpers";

describe("InternalModuleHooks", () => {
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

    it("tp.hooks.on_all_templates_executed shows properties in live preview", async () => {
        const baseName = uniqueTestName("wdio-hooks");
        const targetPath = `${baseName}-target.md`;
        const templatePath = `${baseName}-template.md`;
        cleanupPaths.push(targetPath, templatePath);

        const templateContent = `<%*\ntp.hooks.on_all_templates_executed(async () => {\n  const file = tp.file.find_tfile(tp.file.path(true));\n  await app.fileManager.processFrontMatter(file, (frontmatter) => {\n    frontmatter["key"] = "value";\n  });\n});\n%>\nTEXT THAT SHOULD STAY`;

        const output = await runInNewLeafAndGetOutput({
            templatePath,
            targetPath,
            templateContent,
            targetContent: "",
            waitCache: true,
        });

        expect(await arePropertiesVisible()).toBe(true);
        expect(output).toBe("---\nkey: value\n---\n\nTEXT THAT SHOULD STAY");
    });
});
