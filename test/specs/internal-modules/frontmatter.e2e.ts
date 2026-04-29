import { resetWorkspace } from "../../helpers/obsidianTestHelpers";
import {
    deleteVaultPath,
    runAndGetOutput,
    uniqueTestName,
} from "../../helpers/legacyTemplaterTestHelpers";

describe("InternalModuleFrontmatter", () => {
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

    it("tp.frontmatter", async () => {
        const baseName = uniqueTestName("wdio-frontmatter");
        const targetPath = `${baseName}-target.md`;
        const templatePath = `${baseName}-template.md`;
        cleanupPaths.push(targetPath, templatePath);

        const templateContent = `field1: <% tp.frontmatter.field1 %>\nfield2 with space: <% tp.frontmatter["field2 with space"] %>\nfield3 array: <% tp.frontmatter.field3 %>\nfield4 array: <% tp.frontmatter.field4 %>\n`;

        const targetContent = `---\nfield1: test\nfield2 with space: test test\nfield3: ["a", "b", "c"]\nfield4:\n- a\n- b\n- c\n---`;

        const expectedContent = `field1: test\nfield2 with space: test test\nfield3 array: a,b,c\nfield4 array: a,b,c\n`;

        const output = await runAndGetOutput({
            templatePath,
            targetPath,
            templateContent,
            targetContent,
            waitCache: true,
        });

        expect(output).toBe(expectedContent);
    });
});
