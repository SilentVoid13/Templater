import moment from "moment";
import { browser } from "@wdio/globals";
import { obsidianPage } from "wdio-obsidian-service";
import OpenInsertTemplateModalPage from "../../page-objects/OpenInsertTemplateModal.page";
import WorkspacePage from "../../page-objects/Workspace.page";
import EmptyStateViewPage from "../../page-objects/EmptyStateView.page";
import VaultPage from "../../page-objects/Vault.page";
import ActiveMarkdownViewPage from "../../page-objects/ActiveMarkdownView.page";
import CreateNewNoteFromTemplateModalPage from "../../page-objects/CreateNewNoteFromTemplateModal.page";
import { resetVault } from "../../utils/reset-vault";
import NoticePage from "../../page-objects/Notice.page";

describe("InternalModuleFile", () => {
    const fixedTimestamp = 1619866800000; // 2021-05-01 07:00:00 UTC

    //#region tp.file.title

    it("tp.file.title returns file title", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.title.md": `<% tp.file.title %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.title",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "Untitled");
    });

    it("tp.file.title does not change when file is renamed", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.title.md":
                "<% tp.file.title %>\n" +
                `<%* await tp.file.rename("new name") %>` +
                "<% tp.file.title %>",
            "notes/old name.md": "\n",
        });
        await obsidianPage.openFile("notes/old name.md");
        await WorkspacePage.expectActiveTabToHaveText("old name");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.title",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToNotExist("notes/old name.md");
        await VaultPage.expectFileToHaveContent(
            "notes/new name.md",
            "old name\nold name\n",
        );
    });

    it("tp.file.title returns default name on file creation", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.title.md": "<% tp.file.title %>",
        });
        await CreateNewNoteFromTemplateModalPage.open();
        await CreateNewNoteFromTemplateModalPage.selectSuggestionByName(
            "tp.file.title",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await VaultPage.expectFileToHaveContent("Untitled.md", "Untitled");
    });

    //#endregion

    //#region tp.file.content

    it("tp.file.content returns file content", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.content.md": `<% tp.file.content %>`,
            "notes/note.md": `original content\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.content",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            "original content\noriginal content\n",
        );
    });

    //#endregion

    //#region tp.file.tags

    it("tp.file.tags returns file tags", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.tags.md": `<% tp.file.tags %>`,
            "notes/note.md": `---\ntags:\n- tag1\n- tag2\n---\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.tags",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            "---\ntags:\n- tag1\n- tag2\n---\n#tag1,#tag2",
        );
    });

    it("tp.file.tags returns empty for file with no tags", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.tags.md": `tags:<% tp.file.tags %>`,
            "notes/note.md": `---\nname: Alice\n---\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.tags",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            "---\nname: Alice\n---\ntags:",
        );
    });

    it("tp.file.tags returns empty for file with no frontmatter", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.tags.md": `tags:<% tp.file.tags %>`,
            "notes/note.md": `\nContent`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.tags",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            "tags:\nContent",
        );
    });

    //#endregion

    //#region tp.file.folder

    it("tp.file.folder returns empty name for root file", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.folder.md": `folder:<% tp.file.folder() %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.folder",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "folder:");
    });

    it("tp.file.folder returns folder name and absolute path for file in subfolder", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.folder.md": `<% tp.file.folder() %>|<% tp.file.folder(true) %>`,
            "notes/sub/note.md": `\n`,
        });
        await obsidianPage.openFile("notes/sub/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.folder",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/sub/note.md",
            "sub|notes/sub\n",
        );
    });

    //#endregion

    //#region tp.file.path

    it("tp.file.path returns relative path", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.path.md": `<% tp.file.path(true) %>`,
            "notes/note.md": `\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.path",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            "notes/note.md\n",
        );
    });

    it("tp.file.path returns absolute system path", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.path.md": `<% tp.file.path() %>`,
            "notes/note.md": `\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.path",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        const vaultPath = obsidianPage.getVaultPath();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            vaultPath + "/notes/note.md\n",
        );
    });

    it("tp.file.path returns absolute system path when explicitly false", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.path.md": `<% tp.file.path(false) %>`,
            "notes/note.md": `\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.path",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        const vaultPath = obsidianPage.getVaultPath();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            vaultPath + "/notes/note.md\n",
        );
    });

    //#endregion

    //#region tp.file.cursor

    it("tp.file.cursor removes placeholder when auto jump is enabled", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.cursor.md": `before<% tp.file.cursor() %>after`,
        });
        await browser.executeObsidian(async ({ plugins }) => {
            plugins.templaterObsidian.settings.auto_jump_to_cursor = true;
            await plugins.templaterObsidian.save_settings();
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.cursor",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "beforeafter");
        await ActiveMarkdownViewPage.expectCursorsToEqual([{ line: 0, ch: 6 }]);
    });

    it("tp.file.cursor removes first placeholder by order when auto jump is enabled", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.cursor.md": `before<% tp.file.cursor(0) %>after<% tp.file.cursor(1) %>`,
        });
        await browser.executeObsidian(async ({ plugins }) => {
            plugins.templaterObsidian.settings.auto_jump_to_cursor = true;
            await plugins.templaterObsidian.save_settings();
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.cursor",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            "beforeafter<% tp.file.cursor(1) %>",
        );
        await ActiveMarkdownViewPage.expectCursorsToEqual([{ line: 0, ch: 6 }]);
    });

    it("tp.file.cursor removes multiple placeholders with the same order when auto jump is enabled", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.cursor.md": `before<% tp.file.cursor(1) %>middle<% tp.file.cursor(1) %>after<% tp.file.cursor(2) %>`,
        });
        await browser.executeObsidian(async ({ plugins }) => {
            plugins.templaterObsidian.settings.auto_jump_to_cursor = true;
            await plugins.templaterObsidian.save_settings();
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.cursor",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            "beforemiddleafter<% tp.file.cursor(2) %>",
        );
        await ActiveMarkdownViewPage.expectCursorsToEqual([
            { line: 0, ch: 6 },
            { line: 0, ch: 12 },
        ]);
    });

    it("tp.file.cursor retains placeholder when auto jump is disabled", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.cursor.md": `<% tp.file.cursor() %>`,
        });
        await browser.executeObsidian(async ({ plugins }) => {
            plugins.templaterObsidian.settings.auto_jump_to_cursor = false;
            await plugins.templaterObsidian.save_settings();
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.cursor",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            "<% tp.file.cursor() %>",
        );
    });

    it("tp.file.cursor with order retains placeholder when auto jump is disabled", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.cursor.md": `<% tp.file.cursor(1) %>`,
        });
        await browser.executeObsidian(async ({ plugins }) => {
            plugins.templaterObsidian.settings.auto_jump_to_cursor = false;
            await plugins.templaterObsidian.save_settings();
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.cursor",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            "<% tp.file.cursor(1) %>",
        );
    });

    //#endregion

    //#region tp.file.exists

    it("tp.file.exists returns true for existing file", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.exists.md": `<% tp.file.exists("notes/note.md") %>`,
            "notes/note.md": `\n`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.exists",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "true");
    });

    it("tp.file.exists returns false for missing file", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.exists.md": `<% tp.file.exists("nonexistent.md") %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.exists",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "false");
    });

    it("tp.file.exists returns false when full path is not provided", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.exists.md": `<% tp.file.exists("exists.md") %>`,
            "notes/exists.md": "\n",
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.exists",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "false");
    });

    it("tp.file.exists returns false when extension is not provided", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.exists.md": `<% tp.file.exists("exists") %>`,
            "exists.md": "\n",
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.exists",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "false");
    });

    it("tp.file.exists throws error when no path is provided", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.exists.md": `<% tp.file.exists() %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.exists",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await NoticePage.expectTemplateParsingErrorNotice();
        await VaultPage.expectFileToHaveContent("Untitled.md", "");
    });

    //#endregion

    //#region tp.file.find_tfile

    it("tp.file.find_tfile returns file by name", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.find_tfile.md": `<% tp.file.find_tfile("findme").path %>`,
            "notes/findme.md": `\n`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.find_tfile",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            "notes/findme.md",
        );
    });

    it("tp.file.find_tfile returns file by path", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.find_tfile.md": `<% tp.file.find_tfile("notes/findme").path %>`,
            "notes/findme.md": `\n`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.find_tfile",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            "notes/findme.md",
        );
    });

    it("tp.file.find_tfile returns null for missing file", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.find_tfile.md": `<% tp.file.find_tfile("nonexistent") %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.find_tfile",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "null");
    });

    it("tp.file.find_tfile throws error when no filename provided", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.find_tfile.md": `<% tp.file.find_tfile() %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.find_tfile",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await NoticePage.expectTemplateParsingErrorNotice();
        await VaultPage.expectFileToHaveContent("Untitled.md", "");
    });

    //#endregion

    //#region tp.file.include

    it("tp.file.include includes another file's content by link", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.include.md": `<% tp.file.include('[[include-source]]') %>`,
            "notes/include-source.md": `Included content`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.include",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            "Included content",
        );
    });

    it("tp.file.include includes another file's content by link with path", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.include.md": `<% tp.file.include('[[notes/include-source]]') %>`,
            "notes/include-source.md": `Included content`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.include",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            "Included content",
        );
    });

    it("tp.file.include includes another file's content by TFile", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.include.md": `<% tp.file.include(tp.file.find_tfile("include-source")) %>`,
            "notes/include-source.md": `Included content`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.include",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            "Included content",
        );
    });

    it("tp.file.include includes a section from another file", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.include.md": `<% tp.file.include('[[section-source#Section1]]') %>`,
            "notes/section-source.md": `# Section1\nsection content\n# Section2\nother content`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.include",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            "# Section1\nsection content\n",
        );
    });

    it("tp.file.include includes a block from another file", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.include.md": `<% tp.file.include('[[section-source#^block-id]]') %>`,
            "notes/section-source.md": `# Section1\nsection content\n# Section2\nother content\n^block-id`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.include",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            "other content\n^block-id",
        );
    });

    it("tp.file.include resolves templates in the included file", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.include.md": `<% tp.file.include('[[tp.file.title]]') %>`,
            "templates/tp.file.title.md": `Template content <% tp.file.title %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.include",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            "Template content Untitled",
        );
    });

    it("tp.file.include throws error on self referencing inclusion", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.include.md": `<% tp.file.include('[[tp.file.include]]') %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.include",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await NoticePage.expectInclusionDepthLimitErrorNotice();
        await VaultPage.expectFileToHaveContent("Untitled.md", "");
    });

    it("tp.file.include throws error on circular reference inclusion", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.include-1.md": `<% tp.file.include('[[tp.file.include-2]]') %>`,
            "templates/tp.file.include-2.md": `<% tp.file.include('[[tp.file.include-1]]') %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.include-1",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await NoticePage.expectInclusionDepthLimitErrorNotice();
        await VaultPage.expectFileToHaveContent("Untitled.md", "");
    });

    it("tp.file.include resolves templates up to depth limit", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.include-1.md": `<% tp.file.include('[[tp.file.include-2]]') %>`,
            "templates/tp.file.include-2.md": `<% tp.file.include('[[tp.file.include-3]]') %>`,
            "templates/tp.file.include-3.md": `<% tp.file.include('[[tp.file.include-4]]') %>`,
            "templates/tp.file.include-4.md": `<% tp.file.include('[[tp.file.include-5]]') %>`,
            "templates/tp.file.include-5.md": `<% tp.file.include('[[tp.file.include-6]]') %>`,
            "templates/tp.file.include-6.md": `<% tp.file.include('[[tp.file.include-7]]') %>`,
            "templates/tp.file.include-7.md": `<% tp.file.include('[[tp.file.include-8]]') %>`,
            "templates/tp.file.include-8.md": `<% tp.file.include('[[tp.file.include-9]]') %>`,
            "templates/tp.file.include-9.md": `<% tp.file.include('[[tp.file.include-10]]') %>`,
            "templates/tp.file.include-10.md": `<% tp.file.include('[[tp.file.include-11]]') %>`,
            "templates/tp.file.include-11.md": `End`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.include-1",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "End");
    });

    it("tp.file.include throws error on depth limit reached", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.include-1.md": `<% tp.file.include('[[tp.file.include-2]]') %>`,
            "templates/tp.file.include-2.md": `<% tp.file.include('[[tp.file.include-3]]') %>`,
            "templates/tp.file.include-3.md": `<% tp.file.include('[[tp.file.include-4]]') %>`,
            "templates/tp.file.include-4.md": `<% tp.file.include('[[tp.file.include-5]]') %>`,
            "templates/tp.file.include-5.md": `<% tp.file.include('[[tp.file.include-6]]') %>`,
            "templates/tp.file.include-6.md": `<% tp.file.include('[[tp.file.include-7]]') %>`,
            "templates/tp.file.include-7.md": `<% tp.file.include('[[tp.file.include-8]]') %>`,
            "templates/tp.file.include-8.md": `<% tp.file.include('[[tp.file.include-9]]') %>`,
            "templates/tp.file.include-9.md": `<% tp.file.include('[[tp.file.include-10]]') %>`,
            "templates/tp.file.include-10.md": `<% tp.file.include('[[tp.file.include-11]]') %>`,
            "templates/tp.file.include-11.md": `<% tp.file.include('[[tp.file.include-12]]') %>`,
            "templates/tp.file.include-12.md": `End`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.include-1",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await NoticePage.expectInclusionDepthLimitErrorNotice();
        await VaultPage.expectFileToHaveContent("Untitled.md", "");
    });

    it("tp.file.include resolves sequential includes without hitting depth limit", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.include.md":
                `<% await tp.file.include('[[tp.file.include-1]]') %>\n` +
                `<% await tp.file.include('[[tp.file.include-2]]') %>\n` +
                `<% await tp.file.include('[[tp.file.include-3]]') %>\n` +
                `<% await tp.file.include('[[tp.file.include-4]]') %>\n` +
                `<% await tp.file.include('[[tp.file.include-5]]') %>\n` +
                `<% await tp.file.include('[[tp.file.include-6]]') %>\n` +
                `<% await tp.file.include('[[tp.file.include-7]]') %>\n` +
                `<% await tp.file.include('[[tp.file.include-8]]') %>\n` +
                `<% await tp.file.include('[[tp.file.include-9]]') %>\n` +
                `<% await tp.file.include('[[tp.file.include-10]]') %>\n` +
                `<% await tp.file.include('[[tp.file.include-11]]') %>\n`,
            "templates/tp.file.include-1.md": `tp.file.include-1`,
            "templates/tp.file.include-2.md": `tp.file.include-2`,
            "templates/tp.file.include-3.md": `tp.file.include-3`,
            "templates/tp.file.include-4.md": `tp.file.include-4`,
            "templates/tp.file.include-5.md": `tp.file.include-5`,
            "templates/tp.file.include-6.md": `tp.file.include-6`,
            "templates/tp.file.include-7.md": `tp.file.include-7`,
            "templates/tp.file.include-8.md": `tp.file.include-8`,
            "templates/tp.file.include-9.md": `tp.file.include-9`,
            "templates/tp.file.include-10.md": `tp.file.include-10`,
            "templates/tp.file.include-11.md": `tp.file.include-11`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.include",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            "tp.file.include-1\n" +
                "tp.file.include-2\n" +
                "tp.file.include-3\n" +
                "tp.file.include-4\n" +
                "tp.file.include-5\n" +
                "tp.file.include-6\n" +
                "tp.file.include-7\n" +
                "tp.file.include-8\n" +
                "tp.file.include-9\n" +
                "tp.file.include-10\n" +
                "tp.file.include-11\n",
        );
    });

    // This is a known issue https://github.com/SilentVoid13/Templater/issues/1174
    it.skip("tp.file.include resolves concurrent includes without hitting depth limit", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.include.md":
                `<% tp.file.include('[[tp.file.include-1]]') %>\n` +
                `<% tp.file.include('[[tp.file.include-2]]') %>\n` +
                `<% tp.file.include('[[tp.file.include-3]]') %>\n` +
                `<% tp.file.include('[[tp.file.include-4]]') %>\n` +
                `<% tp.file.include('[[tp.file.include-5]]') %>\n` +
                `<% tp.file.include('[[tp.file.include-6]]') %>\n` +
                `<% tp.file.include('[[tp.file.include-7]]') %>\n` +
                `<% tp.file.include('[[tp.file.include-8]]') %>\n` +
                `<% tp.file.include('[[tp.file.include-9]]') %>\n` +
                `<% tp.file.include('[[tp.file.include-10]]') %>\n` +
                `<% tp.file.include('[[tp.file.include-11]]') %>\n`,
            "templates/tp.file.include-1.md": `tp.file.include-1`,
            "templates/tp.file.include-2.md": `tp.file.include-2`,
            "templates/tp.file.include-3.md": `tp.file.include-3`,
            "templates/tp.file.include-4.md": `tp.file.include-4`,
            "templates/tp.file.include-5.md": `tp.file.include-5`,
            "templates/tp.file.include-6.md": `tp.file.include-6`,
            "templates/tp.file.include-7.md": `tp.file.include-7`,
            "templates/tp.file.include-8.md": `tp.file.include-8`,
            "templates/tp.file.include-9.md": `tp.file.include-9`,
            "templates/tp.file.include-10.md": `tp.file.include-10`,
            "templates/tp.file.include-11.md": `tp.file.include-11`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.include",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            "tp.file.include-1\n" +
                "tp.file.include-2\n" +
                "tp.file.include-3\n" +
                "tp.file.include-4\n" +
                "tp.file.include-5\n" +
                "tp.file.include-6\n" +
                "tp.file.include-7\n" +
                "tp.file.include-8\n" +
                "tp.file.include-9\n" +
                "tp.file.include-10\n" +
                "tp.file.include-11\n",
        );
    });

    //#endregion

    //#region tp.file.creation_date

    it("tp.file.creation_date with default format", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.creation_date.md": `<% tp.file.creation_date() %>`,
            "notes/note.md": `\n`,
        });
        await browser.executeObsidian(({ app }, ctime: number) => {
            const file = app.vault.getFileByPath("notes/note.md");
            if (!file) throw new Error("File not found");
            file.stat.ctime = ctime;
        }, fixedTimestamp);
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.creation_date",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            moment(fixedTimestamp).format("YYYY-MM-DD HH:mm") + "\n",
        );
    });

    it("tp.file.creation_date with custom format", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.creation_date.md": `<% tp.file.creation_date("YYYY-MM-DD") %>`,
            "notes/note.md": `\n`,
        });
        await browser.executeObsidian(({ app }, ctime: number) => {
            const file = app.vault.getFileByPath("notes/note.md");
            if (!file) throw new Error("File not found");
            file.stat.ctime = ctime;
        }, fixedTimestamp);
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.creation_date",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            moment(fixedTimestamp).format("YYYY-MM-DD") + "\n",
        );
    });

    //#endregion

    //#region tp.file.last_modified_date

    it("tp.file.last_modified_date with default format", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.last_modified_date.md": `<% tp.file.last_modified_date() %>`,
            "notes/note.md": `\n`,
        });
        await browser.executeObsidian(({ app }, mtime: number) => {
            const file = app.vault.getFileByPath("notes/note.md");
            if (!file) throw new Error("File not found");
            file.stat.mtime = mtime;
        }, fixedTimestamp);
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.last_modified_date",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            moment(fixedTimestamp).format("YYYY-MM-DD HH:mm") + "\n",
        );
    });

    it("tp.file.last_modified_date with custom format", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.last_modified_date.md": `<% tp.file.last_modified_date("YYYY-MM-DD") %>`,
            "notes/note.md": `\n`,
        });
        await browser.executeObsidian(({ app }, mtime: number) => {
            const file = app.vault.getFileByPath("notes/note.md");
            if (!file) throw new Error("File not found");
            file.stat.mtime = mtime;
        }, fixedTimestamp);
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.last_modified_date",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            moment(fixedTimestamp).format("YYYY-MM-DD") + "\n",
        );
    });

    //#endregion

    //#region tp.file.move

    it("tp.file.move moves active file to new path", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.move.md": `<% tp.file.move("notes/moved") %>`,
            "notes/original.md": `\n`,
        });
        await obsidianPage.openFile("notes/original.md");
        await WorkspacePage.expectActiveTabToHaveText("original");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.move",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToNotExist("notes/original.md");
        await VaultPage.expectFileToHaveContent("notes/moved.md", "\n");
    });

    it("tp.file.move moves active file without changing extension", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.move.md": `<% tp.file.move("notes/moved.txt") %>`,
            "notes/original.md": `\n`,
        });
        await obsidianPage.openFile("notes/original.md");
        await WorkspacePage.expectActiveTabToHaveText("original");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.move",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToNotExist("notes/original.md");
        await VaultPage.expectFileToHaveContent("notes/moved.txt.md", "\n");
    });

    it("tp.file.move moves a non-active file via file_to_move parameter", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.move.md": `<%* await tp.file.move("notes/other-moved", tp.file.find_tfile("other-file")) %>`,
            "notes/note.md": `\n`,
            "notes/other-file.md": `other file content`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.move",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToNotExist("notes/other-file.md");
        await VaultPage.expectFileToHaveContent(
            "notes/other-moved.md",
            "other file content",
        );
        await VaultPage.expectFileToHaveContent("notes/note.md", "\n");
    });

    //#endregion

    //#region tp.file.rename

    it("tp.file.rename renames active file", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.rename.md": `<%* tp.file.rename("renamed") %>`,
            "notes/original.md": `\n`,
        });
        await obsidianPage.openFile("notes/original.md");
        await WorkspacePage.expectActiveTabToHaveText("original");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.rename",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToNotExist("notes/original.md");
        await VaultPage.expectFileToHaveContent("notes/renamed.md", "\n");
    });

    it.skip("tp.file.rename throws on no name", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.rename.md": `<%* tp.file.rename() %>`,
            "notes/original.md": `\n`,
        });
        await obsidianPage.openFile("notes/original.md");
        await WorkspacePage.expectActiveTabToHaveText("original");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.rename",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await NoticePage.expectTemplateParsingErrorNotice();
        await VaultPage.expectFileToHaveContent("notes/original.md", "\n");
    });

    it.skip("tp.file.rename throws on : in name", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.rename.md": `<%* tp.file.rename("invalid:chars") %>`,
            "notes/original.md": `\n`,
        });
        await obsidianPage.openFile("notes/original.md");
        await WorkspacePage.expectActiveTabToHaveText("original");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.rename",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await NoticePage.expectFileNameCannotIncludeCharsErrorNotice();
        await VaultPage.expectFileToHaveContent("notes/original.md", "\n");
    });

    it.skip("tp.file.rename throws on \\ in name", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.rename.md": `<%* tp.file.rename("invalid\\chars") %>`,
            "notes/original.md": `\n`,
        });
        await obsidianPage.openFile("notes/original.md");
        await WorkspacePage.expectActiveTabToHaveText("original");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.rename",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await NoticePage.expectFileNameCannotIncludeCharsErrorNotice();
        await VaultPage.expectFileToHaveContent("notes/original.md", "\n");
    });

    it.skip("tp.file.rename throws on / in name", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.rename.md": `<%* tp.file.rename("invalid/chars") %>`,
            "notes/original.md": `\n`,
        });
        await obsidianPage.openFile("notes/original.md");
        await WorkspacePage.expectActiveTabToHaveText("original");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.rename",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await NoticePage.expectFileNameCannotIncludeCharsErrorNotice();
        await VaultPage.expectFileToHaveContent("notes/original.md", "\n");
    });

    //#endregion

    //#region tp.file.cursor_append

    it("tp.file.cursor_append inserts at cursor in empty file", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.cursor_append.md": `<%* tp.file.cursor_append("appended") %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await ActiveMarkdownViewPage.focusEditor();
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.cursor_append",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "appended");
    });

    it("tp.file.cursor_append inserts at the current cursor position", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.cursor_append.md": `<%* tp.file.cursor_append("INSERTED ") %>`,
            "notes/note.md": `foo bar\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await ActiveMarkdownViewPage.setSelection(
            { line: 0, ch: 4 },
            { line: 0, ch: 4 },
        );
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.cursor_append",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            "foo INSERTED bar\n",
        );
    });

    it("tp.file.cursor_append replaces the current selection", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.cursor_append.md": `<% tp.file.cursor_append("REPLACED") %>`,
            "notes/note.md": `hello world\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await ActiveMarkdownViewPage.setSelection(
            { line: 0, ch: 6 },
            { line: 0, ch: 11 },
        );
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.cursor_append",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            "hello REPLACED\n",
        );
    });

    it("tp.file.cursor_append throws error on no content", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.cursor_append.md": `<% tp.file.cursor_append() %>`,
            "notes/note.md": `hello world\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await ActiveMarkdownViewPage.setSelection(
            { line: 0, ch: 6 },
            { line: 0, ch: 11 },
        );
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.cursor_append",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await NoticePage.expectTemplateParsingErrorNotice();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            "hello world\n",
        );
    });

    //#endregion

    //#region tp.file.selection

    it("tp.file.selection returns selected text when inserting template", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.selection.md": `Selected: <% tp.file.selection() %>`,
            "notes/note.md": `hello world\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await ActiveMarkdownViewPage.setSelection(
            { line: 0, ch: 0 },
            { line: 0, ch: 5 },
        );
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.selection",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            "Selected: hello world\n",
        );
    });

    it("tp.file.selection returns selected text when creating note from template", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.selection.md": `Selected: <% tp.file.selection() %>`,
            "notes/note.md": `hello world\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await ActiveMarkdownViewPage.setSelection(
            { line: 0, ch: 0 },
            { line: 0, ch: 5 },
        );
        await CreateNewNoteFromTemplateModalPage.open();
        await CreateNewNoteFromTemplateModalPage.selectSuggestionByName(
            "tp.file.selection",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            "Selected: hello",
        );
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            "hello world\n",
        );
    });

    // We should consider changing this behavior to grab multiple selections,
    // or adding a new method to handle multiple selections
    it("tp.file.selection returns first selection when multiple selections when creating note from template", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.selection.md": `Selected: <% tp.file.selection() %>`,
            "notes/note.md": `hello world\nsecond line\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await ActiveMarkdownViewPage.setSelections([
            { head: { line: 0, ch: 0 }, anchor: { line: 0, ch: 5 } },
            { head: { line: 1, ch: 7 }, anchor: { line: 1, ch: 11 } },
        ]);
        await CreateNewNoteFromTemplateModalPage.open();
        await CreateNewNoteFromTemplateModalPage.selectSuggestionByName(
            "tp.file.selection",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            "Selected: hello",
        );
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            "hello world\nsecond line\n",
        );
    });

    it("tp.file.selection returns nothing when no selected text when creating note from template", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.selection.md": `Selected: <% tp.file.selection() %>`,
            "notes/note.md": `hello world\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await ActiveMarkdownViewPage.setSelection(
            { line: 0, ch: 0 },
            { line: 0, ch: 0 },
        );
        await CreateNewNoteFromTemplateModalPage.open();
        await CreateNewNoteFromTemplateModalPage.selectSuggestionByName(
            "tp.file.selection",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "Selected: ");
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            "hello world\n",
        );
    });

    //#endregion

    //#region tp.file.create_new

    it("tp.file.create_new creates a note from string content", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.create_new.md": `<%* await tp.file.create_new("child content", "notes/child-note") %>`,
            "notes/note.md": `\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.create_new",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/child-note.md",
            "child content",
        );
    });

    it("tp.file.create_new creates a note from a template file", async () => {
        await resetVault("test/vault", {
            "templates/child-template.md": `# <% tp.file.title %>`,
            "templates/tp.file.create_new.md": `<%* await tp.file.create_new(tp.file.find_tfile("child-template"), "notes/from-template") %>`,
            "notes/note.md": `\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.create_new",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/from-template.md",
            "# from-template",
        );
    });

    it("tp.file.create_new respects folder provided in filename parameter", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.create_new.md": `<%* await tp.file.create_new("in subfolder", "notes/sub/leaf-note") %>`,
            "notes/note.md": `\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.create_new",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/sub/leaf-note.md",
            "in subfolder",
        );
    });

    it("tp.file.create_new respects string folder parameter", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.create_new.md": `<%* await tp.file.create_new("in subfolder", "leaf-note", false, "notes/sub") %>`,
            "notes/note.md": `\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.create_new",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/sub/leaf-note.md",
            "in subfolder",
        );
    });

    it("tp.file.create_new respects tp.file.folder folder parameter", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.create_new.md": `<%* await tp.file.create_new("in subfolder", "leaf-note", false, tp.file.folder(true)) %>`,
            "notes/note.md": `\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.create_new",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/leaf-note.md",
            "in subfolder",
        );
    });

    it("tp.file.create_new respects TFolder folder parameter", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.create_new.md": `<%* await tp.file.create_new("in subfolder", "leaf-note", false, tp.app.vault.getAbstractFileByPath("notes/sub")) %>`,
            "notes/note.md": `\n`,
            "notes/sub/existing.md": `\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.create_new",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/sub/leaf-note.md",
            "in subfolder",
        );
    });

    it("tp.file.create_new opens new note when open_new is true", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.create_new.md": `<%* await tp.file.create_new("opened content", "notes/opened-note", true) %>`,
            "notes/note.md": `\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.create_new",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await WorkspacePage.expectActiveTabToHaveText("opened-note");
        await VaultPage.expectFileToHaveContent(
            "notes/opened-note.md",
            "opened content",
        );
    });

    it("tp.file.create_new does not open new note when open_new is false", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.create_new.md": `<%* await tp.file.create_new("opened content", "notes/opened-note", false) %>`,
            "notes/note.md": `\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.create_new",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await WorkspacePage.expectActiveTabToHaveText("note");
        await VaultPage.expectFileToHaveContent(
            "notes/opened-note.md",
            "opened content",
        );
    });

    it("tp.file.create_new does not open new note when open_new is not provided", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.create_new.md": `<%* await tp.file.create_new("opened content", "notes/opened-note") %>`,
            "notes/note.md": `\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.create_new",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await WorkspacePage.expectActiveTabToHaveText("note");
        await VaultPage.expectFileToHaveContent(
            "notes/opened-note.md",
            "opened content",
        );
    });

    it("tp.file.create_new uses Untitled as default filename", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.create_new.md": `<%* await tp.file.create_new("default content", undefined) %>`,
            "notes/note.md": `\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.create_new",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            "default content",
        );
    });

    it("tp.file.create_new returns created file", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.create_new.md": `[[<% (await tp.file.create_new("child content", "notes/child-note")).basename %>]]`,
            "notes/note.md": `\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.create_new",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/child-note.md",
            "child content",
        );
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            "[[child-note]]\n",
        );
    });

    it("tp.file.create_new gains new tp.config within context of new file and preserves existing tp.config in template file", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.create_new.md":
                `Template file: <% tp.config.template_file.path %>\n` +
                `Target file: <% tp.config.target_file.path %>\n` +
                `Active file: <% tp.config.active_file?.path %>\n` +
                `Run mode: <% tp.config.run_mode %>\n` +
                `<%* await tp.file.create_new(tp.file.find_tfile("tp.file.create_new2"), "notes/child-note") %>\n` +
                `Template file: <% tp.config.template_file.path %>\n` +
                `Target file: <% tp.config.target_file.path %>\n` +
                `Active file: <% tp.config.active_file?.path %>\n` +
                `Run mode: <% tp.config.run_mode %>`,
            "templates/tp.file.create_new2.md":
                `Template file: <% tp.config.template_file.path %>\n` +
                `Target file: <% tp.config.target_file.path %>\n` +
                `Active file: <% tp.config.active_file?.path %>\n` +
                `Run mode: <% tp.config.run_mode %>`,
            "notes/note.md": `\n`,
        });
        await obsidianPage.openFile("notes/note.md");
        await WorkspacePage.expectActiveTabToHaveText("note");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.create_new",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/note.md",
            `Template file: templates/tp.file.create_new.md
Target file: notes/note.md
Active file: notes/note.md
Run mode: 1

Template file: templates/tp.file.create_new.md
Target file: notes/note.md
Active file: notes/note.md
Run mode: 1
`,
        );
        await VaultPage.expectFileToHaveContent(
            "notes/child-note.md",
            `Template file: templates/tp.file.create_new2.md
Target file: notes/child-note.md
Active file: notes/note.md
Run mode: 0`,
        );
    });

    //#endregion
});
