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

    //#endregion

    //#region tp.file.include

    it("tp.file.include includes another file's content", async () => {
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

    it("tp.file.include resolves templates in the included file", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.include.md": `<% tp.file.include('[[include-with-template]]') %>`,
            "notes/include-with-template.md": `<% tp.file.title %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.include",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "Untitled");
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

    it("tp.file.move moves file to new path", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.move.md": `moved:<%* tp.file.move("notes/moved") %>`,
            "notes/original.md": `\n`,
        });
        await obsidianPage.openFile("notes/original.md");
        await WorkspacePage.expectActiveTabToHaveText("original");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.move",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("notes/moved.md", "moved:\n");
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
        await VaultPage.expectFileToHaveContent(
            "notes/other-moved.md",
            "other file content",
        );
        await VaultPage.expectFileToNotExist("notes/other-file.md");
    });

    //#endregion

    //#region tp.file.rename

    it("tp.file.rename renames file", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.rename.md": `renamed:<%* tp.file.rename("renamed") %>`,
            "notes/original.md": `\n`,
        });
        await obsidianPage.openFile("notes/original.md");
        await WorkspacePage.expectActiveTabToHaveText("original");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.file.rename",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/renamed.md",
            "renamed:\n",
        );
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

    //#endregion

    //#region tp.file.selection

    it("tp.file.selection returns selected text", async () => {
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

    //#endregion

    //#region tp.file.create_new

    it("tp.file.create_new creates a note from string content", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.create_new.md": `<%* await tp.file.create_new("child content", "notes/child-note", false) %>`,
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
            "templates/tp.file.create_new.md": `<%* await tp.file.create_new(tp.file.find_tfile("child-template"), "notes/from-template", false) %>`,
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

    it("tp.file.create_new respects the folder parameter", async () => {
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

    it("tp.file.create_new uses Untitled as default filename", async () => {
        await resetVault("test/vault", {
            "templates/tp.file.create_new.md": `<%* await tp.file.create_new("default content", undefined, false) %>`,
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

    //#endregion
});
