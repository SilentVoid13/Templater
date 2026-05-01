import { obsidianPage } from "wdio-obsidian-service";
import OpenInsertTemplateModalPage from "../page-objects/OpenInsertTemplateModal.page";
import WorkspacePage from "../page-objects/Workspace.page";
import EmptyStateViewPage from "../page-objects/EmptyStateView.page";
import VaultPage from "../page-objects/Vault.page";
import ActiveMarkdownViewPage from "../page-objects/ActiveMarkdownView.page";

describe("Templater", () => {
    it("append_template_to_active_file shows properties in live preview", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/template.md": "---\nkey: value\n---\nText",
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("template");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await ActiveMarkdownViewPage.expectPropertiesToBeVisible();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            "---\nkey: value\n---\nText",
        );
    });

    it("append_template_to_active_file gracefully merges YAML primitives", async () => {
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
        await obsidianPage.resetVault("test/vault", {
            "templates/template.md": templateContent,
            "notes/target.md": targetContent,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await obsidianPage.openFile("notes/target.md");
        await WorkspacePage.expectActiveTabToHaveText("target");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("template");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("notes/target.md", expected);
    });

    it("append_template_to_active_file gracefully merges YAML lists", async () => {
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
        await obsidianPage.resetVault("test/vault", {
            "templates/template.md": templateContent,
            "notes/target.md": targetContent,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await obsidianPage.openFile("notes/target.md");
        await WorkspacePage.expectActiveTabToHaveText("target");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("template");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("notes/target.md", expected);
    });

    it("append_template_to_active_file preserves duplicate values in YAML lists that do not match", async () => {
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
        await obsidianPage.resetVault("test/vault", {
            "templates/template.md": templateContent,
            "notes/target.md": targetContent,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await obsidianPage.openFile("notes/target.md");
        await WorkspacePage.expectActiveTabToHaveText("target");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("template");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("notes/target.md", expected);
    });

    it("append_template_to_active_file de-duplicates duplicate values in matching YAML lists", async () => {
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
        await obsidianPage.resetVault("test/vault", {
            "templates/template.md": templateContent,
            "notes/target.md": targetContent,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await obsidianPage.openFile("notes/target.md");
        await WorkspacePage.expectActiveTabToHaveText("target");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("template");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("notes/target.md", expected);
    });

    it("append_template_to_active_file handles mixed data types for same key", async () => {
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
        await obsidianPage.resetVault("test/vault", {
            "templates/template.md": templateContent,
            "notes/target.md": targetContent,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await obsidianPage.openFile("notes/target.md");
        await WorkspacePage.expectActiveTabToHaveText("target");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("template");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("notes/target.md", expected);
    });
});
