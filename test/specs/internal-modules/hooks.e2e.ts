import { obsidianPage } from "wdio-obsidian-service";
import OpenInsertTemplateModalPage from "../../page-objects/OpenInsertTemplateModal.page";
import WorkspacePage from "../../page-objects/Workspace.page";
import EmptyStateViewPage from "../../page-objects/EmptyStateView.page";
import VaultPage from "../../page-objects/Vault.page";
import ActiveMarkdownViewPage from "../../page-objects/ActiveMarkdownView.page";

describe("InternalModuleHooks", () => {
    it("tp.hooks.on_all_templates_executed shows properties in live preview", async () => {
        const templateContent =
            "<%*\n" +
            "tp.hooks.on_all_templates_executed(async () => {\n" +
            "  const file = tp.file.find_tfile(tp.file.path(true));\n" +
            "  await app.fileManager.processFrontMatter(file, (frontmatter) => {\n" +
            '    frontmatter["key"] = "value";\n' +
            "  });\n" +
            "});\n" +
            "%>\n" +
            "TEXT THAT SHOULD STAY";
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.hooks.on_all_templates_executed.md": templateContent,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.hooks.on_all_templates_executed",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await ActiveMarkdownViewPage.expectPropertiesToBeVisible();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            "---\nkey: value\n---\n\nTEXT THAT SHOULD STAY",
        );
    });
});
