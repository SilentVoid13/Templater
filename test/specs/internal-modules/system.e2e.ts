import { obsidianPage } from "wdio-obsidian-service";
import OpenInsertTemplateModalPage from "../../page-objects/OpenInsertTemplateModal.page";
import WorkspacePage from "../../page-objects/Workspace.page";
import EmptyStateViewPage from "../../page-objects/EmptyStateView.page";
import VaultPage from "../../page-objects/Vault.page";
import PromptModalPage from "../../page-objects/PromptModal.page";
import SuggesterModalPage from "../../page-objects/SuggesterModal.page";
import MultiSuggesterModalPage from "../../page-objects/MultiSuggesterModal.page";
import { setClipboardText } from "../../helpers/legacyTemplaterTestHelpers";

describe("InternalModuleSystem", () => {
    it("tp.system.clipboard returns clipboard content", async () => {
        await setClipboardText("Hello from clipboard");
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.system.clipboard.md": `<% tp.system.clipboard() %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.system.clipboard",
        );
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            "Hello from clipboard",
        );
    });

    it("tp.system.prompt returns entered text", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.system.prompt.md": `<% tp.system.prompt("Enter a value") %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.system.prompt",
        );
        await PromptModalPage.enterValue("my typed value");
        await PromptModalPage.submit();
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            "my typed value",
        );
    });

    it("tp.system.prompt uses default value", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.system.prompt.md": `<% tp.system.prompt("Enter a value", "default text") %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.system.prompt",
        );
        await PromptModalPage.submit();
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "default text");
    });

    it("tp.system.prompt returns null on cancel when throw_on_cancel is false", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.system.prompt.md": `<% tp.system.prompt("Enter a value", "", false) %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.system.prompt",
        );
        await PromptModalPage.cancel();
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "null");
    });

    it("tp.system.prompt supports multi-line input", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.system.prompt.md": `<% tp.system.prompt("Enter text", "", false, true) %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.system.prompt",
        );
        await PromptModalPage.enterValue("line one\nline two");
        await PromptModalPage.submitMultiLine();
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "Untitled.md",
            "line one\nline two",
        );
    });

    it("tp.system.suggester returns the value for the selected item", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.system.suggester.md": `<% tp.system.suggester(["Apple", "Banana", "Cherry"], ["apple", "banana", "cherry"]) %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.system.suggester",
        );
        await SuggesterModalPage.selectSuggestionByName("Banana");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "banana");
    });

    it("tp.system.suggester filters items by search query", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.system.suggester.md": `<% tp.system.suggester(["Apple", "Banana", "Cherry"], ["apple", "banana", "cherry"]) %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.system.suggester",
        );
        await SuggesterModalPage.filterAndSelectByName("Cher", "Cherry");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "cherry");
    });

    it("tp.system.suggester returns null on cancel when throw_on_cancel is false", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.system.suggester.md": `<% tp.system.suggester(["Apple", "Banana"], ["apple", "banana"], false) %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.system.suggester",
        );
        await SuggesterModalPage.cancel();
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "null");
    });

    it("tp.system.suggester throws on cancel when throw_on_cancel is true", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.system.suggester.md": `<%* try { await tp.system.suggester(["Apple", "Banana"], ["apple", "banana"], true); } catch(e) { tR += "cancelled"; } %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.system.suggester",
        );
        await SuggesterModalPage.cancel();
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "cancelled");
    });

    it("tp.system.multi_suggester returns selected items as array", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.system.multi_suggester.md": `<% tp.system.multi_suggester(["Apple", "Banana", "Cherry"], ["apple", "banana", "cherry"]) %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.system.multi_suggester",
        );
        await MultiSuggesterModalPage.selectItem("Apple");
        await MultiSuggesterModalPage.save();
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "apple");
    });

    it("tp.system.multi_suggester returns empty array on cancel", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.system.multi_suggester.md": `<% tp.system.multi_suggester(["Apple", "Banana"], ["apple", "banana"], false) %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.system.multi_suggester",
        );
        await MultiSuggesterModalPage.cancel();
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "");
    });

    it("tp.system.multi_suggester throws on cancel when throw_on_cancel is true", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.system.multi_suggester.md": `<%* try { await tp.system.multi_suggester(["Apple", "Banana"], ["apple", "banana"], true); } catch(e) { tR += "cancelled"; } %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.system.multi_suggester",
        );
        await MultiSuggesterModalPage.cancel();
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "cancelled");
    });

    it("tp.system.prompt throws on cancel when throw_on_cancel is true", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.system.prompt.md": `<%* try { await tp.system.prompt("Enter", "", true); } catch(e) { tR += "cancelled"; } %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.system.prompt",
        );
        await PromptModalPage.cancel();
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "cancelled");
    });

    it("tp.system.suggester uses function as text_items", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.system.suggester.md": `<% tp.system.suggester(item => "Item " + item, [1, 2, 3]) %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.system.suggester",
        );
        await SuggesterModalPage.selectSuggestionByName("Item 2");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "2");
    });

    it("tp.system.suggester uses default_value to pre-select item", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.system.suggester.md": `<% tp.system.suggester(["Apple", "Banana", "Cherry"], ["apple", "banana", "cherry"], false, "", undefined, "banana") %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.system.suggester",
        );
        await SuggesterModalPage.submit();
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "banana");
    });

    it("tp.system.multi_suggester returns multiple selected items as comma-separated", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.system.multi_suggester.md": `<% tp.system.multi_suggester(["Apple", "Banana", "Cherry"], ["apple", "banana", "cherry"]) %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.system.multi_suggester",
        );
        await MultiSuggesterModalPage.selectItem("Apple");
        await MultiSuggesterModalPage.selectItem("Cherry");
        await MultiSuggesterModalPage.save();
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "apple,cherry");
    });

    it("tp.system.multi_suggester pre-selects default values", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.system.multi_suggester.md": `<% tp.system.multi_suggester(["Apple", "Banana", "Cherry"], ["apple", "banana", "cherry"], false, "", undefined, ["banana"]) %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.system.multi_suggester",
        );
        await MultiSuggesterModalPage.save();
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "banana");
    });

    it("tp.system.multi_suggester uses function as text_items", async () => {
        await obsidianPage.resetVault("test/vault", {
            "templates/tp.system.multi_suggester.md": `<% tp.system.multi_suggester(item => "Item " + item, [1, 2, 3]) %>`,
        });
        await obsidianPage.loadWorkspaceLayout("empty");
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.system.multi_suggester",
        );
        await MultiSuggesterModalPage.selectItem("Item 2");
        await MultiSuggesterModalPage.save();
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "2");
    });
});
