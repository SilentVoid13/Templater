import moment from "moment";
import { obsidianPage } from "wdio-obsidian-service";
import OpenInsertTemplateModalPage from "../../page-objects/OpenInsertTemplateModal.page";
import WorkspacePage from "../../page-objects/Workspace.page";
import EmptyStateViewPage from "../../page-objects/EmptyStateView.page";
import VaultPage from "../../page-objects/Vault.page";
import NoticePage from "../../page-objects/Notice.page";
import { resetVault } from "../../utils/reset-vault";

describe("InternalModuleDate", () => {
    //#region tp.date.now

    it("tp.date.now uses default format", async () => {
        await resetVault("test/vault", {
            "templates/tp.date.now.md": `<% tp.date.now() %>`,
        });
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

    it("tp.date.now uses custom format", async () => {
        await resetVault("test/vault", {
            "templates/tp.date.now.md": `<% tp.date.now("Do MMMM YYYY") %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.date.now");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            moment().format("Do MMMM YYYY"),
        );
    });

    it("tp.date.now uses positive number offset", async () => {
        await resetVault("test/vault", {
            "templates/tp.date.now.md": `<% tp.date.now("YYYY-MM-DD", 7) %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.date.now");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            moment().add(7, "days").format("YYYY-MM-DD"),
        );
    });

    it("tp.date.now uses negative number offset", async () => {
        await resetVault("test/vault", {
            "templates/tp.date.now.md": `<% tp.date.now("YYYY-MM-DD", -7) %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.date.now");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            moment().add(-7, "days").format("YYYY-MM-DD"),
        );
    });

    it("tp.date.now uses positive string duration offset", async () => {
        await resetVault("test/vault", {
            "templates/tp.date.now.md": `<% tp.date.now("YYYY-MM-DD", "P1M") %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.date.now");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            moment().add("P1M").format("YYYY-MM-DD"),
        );
    });

    it("tp.date.now uses negative string duration offset", async () => {
        await resetVault("test/vault", {
            "templates/tp.date.now.md": `<% tp.date.now("YYYY-MM-DD", "P-1M") %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.date.now");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            moment().add("P-1M").format("YYYY-MM-DD"),
        );
    });

    it("tp.date.now uses reference date with default reference format", async () => {
        await resetVault("test/vault", {
            "templates/tp.date.now.md": `<% tp.date.now("YYYY-MM-DD", 0, "2025-01-15") %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.date.now");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "2025-01-15");
    });

    it("tp.date.now uses reference date with custom reference format", async () => {
        await resetVault("test/vault", {
            "templates/tp.date.now.md": `<% tp.date.now("YYYY-MM-DD", 0, "01/15/2025", "MM/DD/YYYY") %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.date.now");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "2025-01-15");
    });

    it("tp.date.now fails with reference date with invalid custom reference format", async () => {
        await resetVault("test/vault", {
            "templates/tp.date.now.md": `<% tp.date.now("YYYY-MM-DD", 0, "01/15/2025", "DD/MM/YYYY") %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.date.now");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await NoticePage.expectInvalidReferenceDateFormatErrorNotice();
        await VaultPage.expectFileToHaveContent("Untitled.md", "");
    });

    it("tp.date.now uses file title as reference date with default format", async () => {
        await resetVault("test/vault", {
            "templates/tp.date.now.md": `<% tp.date.now("YYYY-MM-DD", 7, tp.file.title) %>`,
            "notes/2025-06-01.md": `\n`,
        });
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

    it("tp.date.now uses file path as reference date with custom format", async () => {
        await resetVault("test/vault", {
            "templates/tp.date.now.md": `<% tp.date.now("YYYY-MM-DD", 7, tp.file.path(true), "[Daily]/YYYY/MM/DD[.md]") %>`,
            "Daily/2025/06/01.md": `\n`,
        });
        await obsidianPage.openFile("Daily/2025/06/01.md");
        await WorkspacePage.expectActiveTabToHaveText("01");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.date.now");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Daily/2025/06/01.md",
            "2025-06-08\n",
        );
    });

    it("tp.date.now uses custom format with zero offset", async () => {
        await resetVault("test/vault", {
            "templates/tp.date.now.md": `<% tp.date.now("DD/MM/YYYY", 0) %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.date.now");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            moment().format("DD/MM/YYYY"),
        );
    });

    it("tp.date.now uses custom format with positive offset", async () => {
        await resetVault("test/vault", {
            "templates/tp.date.now.md": `<% tp.date.now("DD/MM/YYYY", 1) %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.date.now");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            moment().add(1, "days").format("DD/MM/YYYY"),
        );
    });

    it("tp.date.now uses custom format with negative offset", async () => {
        await resetVault("test/vault", {
            "templates/tp.date.now.md": `<% tp.date.now("DD/MM/YYYY", -1) %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName("tp.date.now");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            moment().add(-1, "days").format("DD/MM/YYYY"),
        );
    });

    //#endregion

    //#region tp.date.tomorrow

    it("tp.date.tomorrow uses default format", async () => {
        await resetVault("test/vault", {
            "templates/tp.date.tomorrow.md": `<% tp.date.tomorrow() %>`,
        });
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
        await resetVault("test/vault", {
            "templates/tp.date.tomorrow.md": `<% tp.date.tomorrow("DD/MM/YYYY") %>`,
        });
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

    //#endregion

    //#region tp.date.yesterday

    it("tp.date.yesterday uses default format", async () => {
        await resetVault("test/vault", {
            "templates/tp.date.yesterday.md": `<% tp.date.yesterday() %>`,
        });
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
        await resetVault("test/vault", {
            "templates/tp.date.yesterday.md": `<% tp.date.yesterday("DD/MM/YYYY") %>`,
        });
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

    //#endregion

    //#region tp.date.weekday

    // weekday() is locale-sensitive; tests assume en-US locale (Sunday = weekday 0).
    // Jan 12, 2025 is a Sunday.

    it("tp.date.weekday fails if no format or weekday", async () => {
        await resetVault("test/vault", {
            "templates/tp.date.weekday.md": `<% tp.date.weekday() %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.date.weekday",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await NoticePage.expectTemplateParsingErrorNotice();
        await NoticePage.dismissAll();
        await VaultPage.expectFileToHaveContent("Untitled.md", "");
    });

    it("tp.date.weekday fails if no weekday", async () => {
        await resetVault("test/vault", {
            "templates/tp.date.weekday.md": `<% tp.date.weekday("DD/MM/YYYY") %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.date.weekday",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await NoticePage.expectTemplateParsingErrorNotice();
        await NoticePage.dismissAll();
        await VaultPage.expectFileToHaveContent("Untitled.md", "");
    });

    it("tp.date.weekday uses default format", async () => {
        await resetVault("test/vault", {
            "templates/tp.date.weekday.md": `<% tp.date.weekday(undefined, 0) %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.date.weekday",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            moment().weekday(0).format("YYYY-MM-DD"),
        );
    });

    it("tp.date.weekday uses custom format", async () => {
        await resetVault("test/vault", {
            "templates/tp.date.weekday.md": `<% tp.date.weekday("DD/MM/YYYY", 0) %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.date.weekday",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            moment().weekday(0).format("DD/MM/YYYY"),
        );
    });

    it("tp.date.weekday uses positive weekday", async () => {
        await resetVault("test/vault", {
            "templates/tp.date.weekday.md": `<% tp.date.weekday("DD/MM/YYYY", 3) %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.date.weekday",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            moment().weekday(3).format("DD/MM/YYYY"),
        );
    });

    // Jan 12, 2025 is a Sunday (weekday 0 in en-US). weekday(-7) goes back 7 days to the previous Sunday.
    it("tp.date.weekday uses negative weekday", async () => {
        await resetVault("test/vault", {
            "templates/tp.date.weekday.md": `<% tp.date.weekday("DD/MM/YYYY", -7) %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.date.weekday",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            moment().weekday(-7).format("DD/MM/YYYY"),
        );
    });

    it("tp.date.weekday uses reference date with default format", async () => {
        await resetVault("test/vault", {
            "templates/tp.date.weekday.md": `<% tp.date.weekday("YYYY-MM-DD", 0, "2025-01-12") %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.date.weekday",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "2025-01-12");
    });

    it("tp.date.weekday uses reference date with custom format", async () => {
        await resetVault("test/vault", {
            "templates/tp.date.weekday.md": `<% tp.date.weekday("dddd", 0, "2025-01-12") %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.date.weekday",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "Sunday");
    });

    it("tp.date.weekday uses reference date with custom reference format", async () => {
        await resetVault("test/vault", {
            "templates/tp.date.weekday.md": `<% tp.date.weekday("YYYY-MM-DD", 0, "12/01/2025", "DD/MM/YYYY") %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.date.weekday",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "2025-01-12");
    });

    it("tp.date.weekday fails with reference date with invalid custom reference format", async () => {
        await resetVault("test/vault", {
            "templates/tp.date.weekday.md": `<% tp.date.weekday("YYYY-MM-DD", 0, "13/12/2025", "MM/DD/YYYY") %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.date.weekday",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await NoticePage.expectInvalidReferenceDateFormatErrorNotice();
        await VaultPage.expectFileToHaveContent("Untitled.md", "");
    });

    // Jan 12, 2025 is a Sunday (weekday 0 in en-US). weekday(-7) goes back 7 days to the previous Sunday.
    it("tp.date.weekday uses negative offset with reference date", async () => {
        await resetVault("test/vault", {
            "templates/tp.date.weekday.md": `<% tp.date.weekday("YYYY-MM-DD", -7, "2025-01-12") %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.date.weekday",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "2025-01-05");
    });

    // Jan 12, 2025 is a Sunday (weekday 0 in en-US). weekday(-7) goes back 7 days to the previous Sunday.
    it("tp.date.weekday uses negative offset with reference date and reference format", async () => {
        await resetVault("test/vault", {
            "templates/tp.date.weekday.md": `<% tp.date.weekday("YYYY-MM-DD", -7, "12/01/2025", "DD/MM/YYYY") %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.date.weekday",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "2025-01-05");
    });

    //#endregion
});
