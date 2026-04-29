import { resetWorkspace } from "../../helpers/obsidianTestHelpers";
import {
    deleteVaultPath,
    runAndGetOutput,
    uniqueTestName,
} from "../../helpers/legacyTemplaterTestHelpers";

describe("InternalModuleConfig", () => {
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

    it("tp.config", async () => {
        const baseName = uniqueTestName("wdio-config");
        const targetPath = `${baseName}-target.md`;
        const templatePath = `${baseName}-template.md`;
        cleanupPaths.push(targetPath, templatePath);

        const templateFileOutput = await runAndGetOutput({
            templatePath,
            targetPath,
            templateContent:
                "Template file: <% tp.config.template_file.path %>\n\n",
            targetContent: "",
        });
        expect(templateFileOutput).toBe(`Template file: ${templatePath}\n\n`);

        const targetFileOutput = await runAndGetOutput({
            templatePath,
            targetPath,
            templateContent:
                "Target file: <% tp.config.target_file.path %>\n\n",
            targetContent: "",
        });
        expect(targetFileOutput).toBe(`Target file: ${targetPath}\n\n`);

        const runModeOutput = await runAndGetOutput({
            templatePath,
            targetPath,
            templateContent: "Run mode: <% tp.config.run_mode %>\n\n",
            targetContent: "",
        });
        expect(runModeOutput).toBe("Run mode: 2\n\n");
    });
});
