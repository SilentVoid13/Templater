import { resetWorkspace } from "../helpers/obsidianTestHelpers";
import {
    arePropertiesVisible,
    deleteVaultPath,
    runInNewLeafAndGetOutput,
    uniqueTestName,
} from "../helpers/legacyTemplaterTestHelpers";

describe("Templater", () => {
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

    it("append_template_to_active_file shows properties in live preview", async () => {
        const baseName = uniqueTestName("wdio-templater-properties");
        const targetPath = `${baseName}-target.md`;
        const templatePath = `${baseName}-template.md`;
        cleanupPaths.push(targetPath, templatePath);

        const output = await runInNewLeafAndGetOutput({
            templatePath,
            targetPath,
            templateContent: "---\nkey: value\n---\nText",
            targetContent: "",
        });

        expect(await arePropertiesVisible()).toBe(true);
        expect(output).toBe("---\nkey: value\n---\nText");
    });

    it("append_template_to_active_file gracefully merges YAML primitives", async () => {
        const baseName = uniqueTestName("wdio-templater-primitives");
        const targetPath = `${baseName}-target.md`;
        const templatePath = `${baseName}-template.md`;
        cleanupPaths.push(targetPath, templatePath);

        const templateContent =
            "---\n" +
            "only_in_template: template value\n" +
            "both: template value\n" +
            "---\n";
        const targetContent =
            "---\n" +
            "only_in_target: target value\n" +
            "both: target value\n" +
            "---\n";
        const expected =
            "---\n" +
            "only_in_target: target value\n" +
            "both: template value\n" +
            "only_in_template: template value\n" +
            "---\n";

        const output = await runInNewLeafAndGetOutput({
            templatePath,
            targetPath,
            templateContent,
            targetContent,
            waitCache: true,
        });

        expect(output).toBe(expected);
    });

    it("append_template_to_active_file gracefully merges YAML lists", async () => {
        const baseName = uniqueTestName("wdio-templater-lists");
        const targetPath = `${baseName}-target.md`;
        const templatePath = `${baseName}-template.md`;
        cleanupPaths.push(targetPath, templatePath);

        const templateContent =
            "---\n" +
            "only_in_template:\n" +
            "  - template_item1\n" +
            "  - template_item2\n" +
            "both:\n" +
            "  - template_value1\n" +
            "  - template_value2\n" +
            "---\n";
        const targetContent =
            "---\n" +
            "only_in_target:\n" +
            "  - target_item1\n" +
            "  - target_item2\n" +
            "both:\n" +
            "  - target_value1\n" +
            "  - target_value2\n" +
            "---\n";
        const expected =
            "---\n" +
            "only_in_target:\n" +
            "  - target_item1\n" +
            "  - target_item2\n" +
            "both:\n" +
            "  - target_value1\n" +
            "  - target_value2\n" +
            "  - template_value1\n" +
            "  - template_value2\n" +
            "only_in_template:\n" +
            "  - template_item1\n" +
            "  - template_item2\n" +
            "---\n";

        const output = await runInNewLeafAndGetOutput({
            templatePath,
            targetPath,
            templateContent,
            targetContent,
            waitCache: true,
        });

        expect(output).toBe(expected);
    });

    it("append_template_to_active_file preserves duplicate values in YAML lists that do not match", async () => {
        const baseName = uniqueTestName("wdio-templater-preserve-duplicates");
        const targetPath = `${baseName}-target.md`;
        const templatePath = `${baseName}-template.md`;
        cleanupPaths.push(targetPath, templatePath);

        const templateContent =
            "---\n" +
            "template_duplicates:\n" +
            "  - duplicate_value\n" +
            "  - duplicate_value\n" +
            "  - unique_value\n" +
            "---\n";
        const targetContent =
            "---\n" +
            "target_duplicates:\n" +
            "  - another_duplicate\n" +
            "  - another_duplicate\n" +
            "  - another_unique\n" +
            "---\n";
        const expected =
            "---\n" +
            "target_duplicates:\n" +
            "  - another_duplicate\n" +
            "  - another_duplicate\n" +
            "  - another_unique\n" +
            "template_duplicates:\n" +
            "  - duplicate_value\n" +
            "  - duplicate_value\n" +
            "  - unique_value\n" +
            "---\n";

        const output = await runInNewLeafAndGetOutput({
            templatePath,
            targetPath,
            templateContent,
            targetContent,
            waitCache: true,
        });

        expect(output).toBe(expected);
    });

    it("append_template_to_active_file de-duplicates duplicate values in matching YAML lists", async () => {
        const baseName = uniqueTestName("wdio-templater-dedup-duplicates");
        const targetPath = `${baseName}-target.md`;
        const templatePath = `${baseName}-template.md`;
        cleanupPaths.push(targetPath, templatePath);

        const templateContent =
            "---\n" +
            "duplicates_when_merged:\n" +
            "  - template_item\n" +
            "  - shared_item\n" +
            "duplicates_pre_merge:\n" +
            "  - template_item\n" +
            "  - template_item\n" +
            "duplicates_post_merge:\n" +
            "  - template_item\n" +
            "---\n";
        const targetContent =
            "---\n" +
            "duplicates_when_merged:\n" +
            "  - target_item\n" +
            "  - shared_item\n" +
            "duplicates_pre_merge:\n" +
            "  - target_item\n" +
            "duplicates_post_merge:\n" +
            "  - target_item\n" +
            "  - target_item\n" +
            "---\n";
        const expected =
            "---\n" +
            "duplicates_when_merged:\n" +
            "  - target_item\n" +
            "  - shared_item\n" +
            "  - template_item\n" +
            "duplicates_pre_merge:\n" +
            "  - target_item\n" +
            "  - template_item\n" +
            "duplicates_post_merge:\n" +
            "  - target_item\n" +
            "  - template_item\n" +
            "---\n";

        const output = await runInNewLeafAndGetOutput({
            templatePath,
            targetPath,
            templateContent,
            targetContent,
            waitCache: true,
        });

        expect(output).toBe(expected);
    });

    it("append_template_to_active_file handles mixed data types for same key", async () => {
        const baseName = uniqueTestName("wdio-templater-mixed-types");
        const targetPath = `${baseName}-target.md`;
        const templatePath = `${baseName}-template.md`;
        cleanupPaths.push(targetPath, templatePath);

        const templateContent =
            "---\n" +
            "string_to_list:\n" +
            "  - template_item1\n" +
            "  - template_item2\n" +
            "list_to_string: template string\n" +
            "string_to_number: 42\n" +
            "list_to_boolean: true\n" +
            "---\n";
        const targetContent =
            "---\n" +
            "string_to_list: target string\n" +
            "list_to_string:\n" +
            "  - target_item1\n" +
            "  - target_item2\n" +
            "string_to_number: existing string\n" +
            "list_to_boolean:\n" +
            "  - existing_item\n" +
            "---\n";
        const expected =
            "---\n" +
            "string_to_list:\n" +
            "  - template_item1\n" +
            "  - template_item2\n" +
            "list_to_string: template string\n" +
            "string_to_number: 42\n" +
            "list_to_boolean: true\n" +
            "---\n";

        const output = await runInNewLeafAndGetOutput({
            templatePath,
            targetPath,
            templateContent,
            targetContent,
            waitCache: true,
        });

        expect(output).toBe(expected);
    });
});
