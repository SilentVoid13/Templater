import { obsidianPage } from "wdio-obsidian-service";
import OpenInsertTemplateModalPage from "../../page-objects/OpenInsertTemplateModal.page";
import WorkspacePage from "../../page-objects/Workspace.page";
import EmptyStateViewPage from "../../page-objects/EmptyStateView.page";
import VaultPage from "../../page-objects/Vault.page";
import { resetVault } from "../../utils/reset-vault";

describe("InternalModuleFrontmatter", () => {
    it("tp.frontmatter reads simple string field", async () => {
        await resetVault("test/vault", {
            "templates/tp.frontmatter.md": `<% tp.frontmatter.name %>`,
            "notes/note.md": `---\nname: Alice\n---\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.frontmatter",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            "---\nname: Alice\n---\nAlice",
        );
    });

    it("tp.frontmatter reads field with spaces via bracket notation", async () => {
        await resetVault("test/vault", {
            "templates/tp.frontmatter.md": `<% tp.frontmatter["note type"] %>`,
            "notes/note.md": `---\nnote type: daily\n---\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.frontmatter",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            "---\nnote type: daily\n---\ndaily",
        );
    });

    it("tp.frontmatter reads JSON array field as comma-separated", async () => {
        await resetVault("test/vault", {
            "templates/tp.frontmatter.md": `<% tp.frontmatter.tags %>`,
            "notes/note.md": `---\ntags: ["work", "project"]\n---\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.frontmatter",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            '---\ntags: ["work", "project"]\n---\nwork,project',
        );
    });

    it("tp.frontmatter reads YAML list as comma-separated", async () => {
        await resetVault("test/vault", {
            "templates/tp.frontmatter.md": `<% tp.frontmatter.items %>`,
            "notes/note.md": `---\nitems:\n- a\n- b\n- c\n---\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.frontmatter",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            "---\nitems:\n- a\n- b\n- c\n---\na,b,c",
        );
    });

    it("tp.frontmatter reads multiple fields in one template", async () => {
        await resetVault("test/vault", {
            "templates/tp.frontmatter.md": `<% tp.frontmatter.name %> <% tp.frontmatter.role %>`,
            "notes/note.md": `---\nname: Alice\nrole: admin\n---\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.frontmatter",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            "---\nname: Alice\nrole: admin\n---\nAlice admin",
        );
    });

    it("tp.frontmatter reads boolean value", async () => {
        await resetVault("test/vault", {
            "templates/tp.frontmatter.md": `<% tp.frontmatter.published %>`,
            "notes/note.md": `---\npublished: true\n---\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.frontmatter",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            "---\npublished: true\n---\ntrue",
        );
    });

    it("tp.frontmatter reads number value", async () => {
        await resetVault("test/vault", {
            "templates/tp.frontmatter.md": `<% tp.frontmatter.priority %>`,
            "notes/note.md": `---\npriority: 42\n---\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.frontmatter",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            "---\npriority: 42\n---\n42",
        );
    });

    it("tp.frontmatter returns undefined for file with no frontmatter block", async () => {
        await resetVault("test/vault", {
            "templates/tp.frontmatter.md": `<% tp.frontmatter.anything %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.frontmatter",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "undefined");
    });

    it("tp.frontmatter returns undefined for missing key", async () => {
        await resetVault("test/vault", {
            "templates/tp.frontmatter.md": `<% tp.frontmatter.missing %>`,
            "notes/note.md": `---\nname: Alice\n---\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.frontmatter",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            "---\nname: Alice\n---\nundefined",
        );
    });
});
