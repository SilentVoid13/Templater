import moment from "moment";
import { obsidianPage } from "wdio-obsidian-service";
import OpenInsertTemplateModalPage from "../../page-objects/OpenInsertTemplateModal.page";
import WorkspacePage from "../../page-objects/Workspace.page";
import EmptyStateViewPage from "../../page-objects/EmptyStateView.page";
import VaultPage from "../../page-objects/Vault.page";

describe("InternalModuleDate", () => {
    it("tp.date.now returns today with default format", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.date.now.md": `<% tp.date.now() %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.date.now");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            moment().format("YYYY-MM-DD"),
        );
    });

    it("tp.date.now uses reference date", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.date.now.md": `<% tp.date.now("YYYY-MM-DD", 0, "2025-01-15") %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.date.now");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "2025-01-15");
    });

    it("tp.date.now uses custom output format", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.date.now.md": `<% tp.date.now("DD/MM/YYYY", 0, "2025-01-15") %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.date.now");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "15/01/2025");
    });

    it("tp.date.now applies positive numeric day offset", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.date.now.md": `<% tp.date.now("YYYY-MM-DD", 5, "2025-01-15") %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.date.now");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "2025-01-20");
    });

    it("tp.date.now applies negative numeric day offset", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.date.now.md": `<% tp.date.now("YYYY-MM-DD", -3, "2025-01-15") %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.date.now");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "2025-01-12");
    });

    it("tp.date.now applies string duration offset", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.date.now.md": `<% tp.date.now("YYYY-MM-DD", "P1M", "2025-01-15") %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.date.now");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "2025-02-15");
    });

    it("tp.date.now parses reference with custom reference_format", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.date.now.md": `<% tp.date.now("YYYY-MM-DD", 0, "15/01/2025", "DD/MM/YYYY") %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.date.now");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "2025-01-15");
    });

    it("tp.date.tomorrow returns tomorrow with default format", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.date.tomorrow.md": `<% tp.date.tomorrow() %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.date.tomorrow",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            moment().add(1, "days").format("YYYY-MM-DD"),
        );
    });

    it("tp.date.tomorrow uses custom format", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.date.tomorrow.md": `<% tp.date.tomorrow("DD/MM/YYYY") %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.date.tomorrow",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            moment().add(1, "days").format("DD/MM/YYYY"),
        );
    });

    it("tp.date.yesterday returns yesterday with default format", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.date.yesterday.md": `<% tp.date.yesterday() %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.date.yesterday",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            moment().add(-1, "days").format("YYYY-MM-DD"),
        );
    });

    it("tp.date.yesterday uses custom format", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.date.yesterday.md": `<% tp.date.yesterday("DD/MM/YYYY") %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.date.yesterday",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            moment().add(-1, "days").format("DD/MM/YYYY"),
        );
    });

    // weekday() is locale-sensitive; tests assume en-US locale (Sunday = weekday 0).
    // Jan 12, 2025 is a Sunday.
    it("tp.date.weekday returns correct weekday from reference", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.date.weekday.md": `<% tp.date.weekday("YYYY-MM-DD", 0, "2025-01-12") %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.date.weekday",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "2025-01-12");
    });

    it("tp.date.weekday uses custom output format", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.date.weekday.md": `<% tp.date.weekday("dddd", 0, "2025-01-12") %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.date.weekday",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "Sunday");
    });

    it("tp.date.weekday parses reference with custom reference_format", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.date.weekday.md": `<% tp.date.weekday("YYYY-MM-DD", 0, "12/01/2025", "DD/MM/YYYY") %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.date.weekday",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "2025-01-12");
    });

    it("tp.date.now applies negative string duration offset", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.date.now.md": `<% tp.date.now("YYYY-MM-DD", "P-1M", "2025-01-15") %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.date.now");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "2024-12-15");
    });

    // Jan 12, 2025 is a Sunday (weekday 0 in en-US). weekday(-7) goes back 7 days to the previous Sunday.
    it("tp.date.weekday with negative offset returns same weekday from previous week", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.date.weekday.md": `<% tp.date.weekday("YYYY-MM-DD", -7, "2025-01-12") %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.date.weekday",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "2025-01-05");
    });

    it("tp.date.now uses file title as reference date", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.date.now.md": `<% tp.date.now("YYYY-MM-DD", 7, tp.file.title) %>`,
            "notes/2025-06-01.md": `\n`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await obsidianPage.openFile("notes/2025-06-01.md");
        await WorkspacePage.expectActiveTabToHaveText("2025-06-01");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.date.now");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/2025-06-01.md",
            "2025-06-08\n",
        );
    });
});
