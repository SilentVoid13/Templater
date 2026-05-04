import OpenInsertTemplateModalPage from "../../page-objects/OpenInsertTemplateModal.page";
import WorkspacePage from "../../page-objects/Workspace.page";
import EmptyStateViewPage from "../../page-objects/EmptyStateView.page";
import VaultPage from "../../page-objects/Vault.page";
import PromptModalPage from "../../page-objects/PromptModal.page";
import SuggesterModalPage from "../../page-objects/SuggesterModal.page";
import MultiSuggesterModalPage from "../../page-objects/MultiSuggesterModal.page";
import ClipboardPage from "../../page-objects/Clipboard.page";
import { resetVault } from "../../utils/reset-vault";
import NoticePage from "../../page-objects/Notice.page";

describe("InternalModuleSystem", () => {
    //#region tp.system.clipboard

    it("tp.system.clipboard returns clipboard content", async () => {
        await ClipboardPage.setClipboardText("Hello from clipboard");
        await resetVault("test/vault", {
            "templates/tp.system.clipboard.md": `<% tp.system.clipboard() %>`,
        });
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

    //#endregion

    //#region tp.system.prompt

    it("tp.system.prompt returns entered text", async () => {
        await resetVault("test/vault", {
            "templates/tp.system.prompt.md": `<% await tp.system.prompt("Enter a value") %>`,
        });
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
        await resetVault("test/vault", {
            "templates/tp.system.prompt.md": `<% await tp.system.prompt("Enter a value", "default text") %>`,
        });
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

    it("tp.system.prompt returns null on cancel when throw_on_cancel is not set", async () => {
        await resetVault("test/vault", {
            "templates/tp.system.prompt.md": `<% await tp.system.prompt("Enter a value") %>`,
        });
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

    it("tp.system.prompt returns null on cancel when throw_on_cancel is false", async () => {
        await resetVault("test/vault", {
            "templates/tp.system.prompt.md": `<% await tp.system.prompt("Enter a value", "", false) %>`,
        });
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

    it("tp.system.prompt throws error on cancel when throw_on_cancel is true", async () => {
        await resetVault("test/vault", {
            "templates/tp.system.prompt.md": `<%* try { await tp.system.prompt("Enter a value", "", true); } catch (e) { tR += "cancelled"; } %>`,
        });
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

    it("tp.system.prompt shows error notice on cancel when throw_on_cancel is true and not caught", async () => {
        await resetVault("test/vault", {
            "templates/tp.system.prompt.md": `<% await tp.system.prompt("Enter a value", "", true) %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.system.prompt",
        );
        await PromptModalPage.cancel();
        await WorkspacePage.waitForAllTemplatesExecuted();
        await NoticePage.expectCancelledPromptErrorNotice();
        await VaultPage.expectFileToHaveContent("Untitled.md", "");
    });

    it("tp.system.prompt supports multi-line input", async () => {
        await resetVault("test/vault", {
            "templates/tp.system.prompt.md": `<% await tp.system.prompt("Enter text", "", false, true) %>`,
        });
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

    //#endregion

    //#region tp.system.suggester

    it("tp.system.suggester returns the value for the selected item", async () => {
        await resetVault("test/vault", {
            "templates/tp.system.suggester.md": `<% await tp.system.suggester(["Apple", "Banana", "Cherry"], ["apple", "banana", "cherry"]) %>`,
        });
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
        await resetVault("test/vault", {
            "templates/tp.system.suggester.md": `<% await tp.system.suggester(["Apple", "Banana", "Cherry"], ["apple", "banana", "cherry"]) %>`,
        });
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

    it("tp.system.suggester uses function as text_items", async () => {
        await resetVault("test/vault", {
            "templates/tp.system.suggester.md": `<% await tp.system.suggester(item => "Item " + item, [1, 2, 3]) %>`,
        });
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

    it("tp.system.suggester returns null on cancel when throw_on_cancel is not set", async () => {
        await resetVault("test/vault", {
            "templates/tp.system.suggester.md": `<% await tp.system.suggester(["Apple", "Banana"], ["apple", "banana"]) %>`,
        });
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

    it("tp.system.suggester returns null on cancel when throw_on_cancel is false", async () => {
        await resetVault("test/vault", {
            "templates/tp.system.suggester.md": `<% await tp.system.suggester(["Apple", "Banana"], ["apple", "banana"], false) %>`,
        });
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
        await resetVault("test/vault", {
            "templates/tp.system.suggester.md": `<%* try { await tp.system.suggester(["Apple", "Banana"], ["apple", "banana"], true); } catch(e) { tR += "cancelled"; } %>`,
        });
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

    it("tp.system.suggester shows error notice on cancel when throw_on_cancel is true and not caught", async () => {
        await resetVault("test/vault", {
            "templates/tp.system.suggester.md": `<% await tp.system.suggester(["Apple", "Banana"], ["apple", "banana"], true) %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.system.suggester",
        );
        await SuggesterModalPage.cancel();
        await WorkspacePage.waitForAllTemplatesExecuted();
        await NoticePage.expectCancelledPromptErrorNotice();
        await VaultPage.expectFileToHaveContent("Untitled.md", "");
    });

    it("tp.system.suggester respects placeholder", async () => {
        await resetVault("test/vault", {
            "templates/tp.system.suggester.md": `<% await tp.system.suggester(["Apple", "Banana"], ["apple", "banana"], false, "Pick a fruit") %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.system.suggester",
        );
        await SuggesterModalPage.expectPlaceholderToBe("Pick a fruit");
        await SuggesterModalPage.selectSuggestionByName("Banana");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "banana");
    });

    it("tp.system.suggester respects limit", async () => {
        await resetVault("test/vault", {
            "templates/tp.system.suggester.md": `<% await tp.system.suggester(["Apple", "Banana", "Cherry"], ["apple", "banana", "cherry"], false, "", 2) %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.system.suggester",
        );
        await SuggesterModalPage.expectSuggestionCountToBe(2);
        await SuggesterModalPage.filterAndSelectByName("Cherry", "Cherry");
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "cherry");
    });

    it("tp.system.suggester uses default_value to pre-select item", async () => {
        await resetVault("test/vault", {
            "templates/tp.system.suggester.md": `<% await tp.system.suggester(["Apple", "Banana", "Cherry"], ["apple", "banana", "cherry"], false, "", undefined, "banana") %>`,
        });
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

    //#endregion

    //#region tp.system.multi_suggester

    it("tp.system.multi_suggester returns selected item", async () => {
        await resetVault("test/vault", {
            "templates/tp.system.multi_suggester.md": `<% await tp.system.multi_suggester(["Apple", "Banana", "Cherry"], ["apple", "banana", "cherry"]) %>`,
        });
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

    it("tp.system.multi_suggester returns multiple selected items comma separated", async () => {
        await resetVault("test/vault", {
            "templates/tp.system.multi_suggester.md": `<% await tp.system.multi_suggester(["Apple", "Banana", "Cherry"], ["apple", "banana", "cherry"]) %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.system.multi_suggester",
        );
        await MultiSuggesterModalPage.selectItem("Apple");
        await MultiSuggesterModalPage.filterAndSelectByName("Cherry", "Cherry");
        await MultiSuggesterModalPage.save();
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "apple,cherry");
    });

    it("tp.system.multi_suggester uses function as text_items", async () => {
        await resetVault("test/vault", {
            "templates/tp.system.multi_suggester.md": `<% await tp.system.multi_suggester(item => "Item " + item, [1, 2, 3]) %>`,
        });
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

    it("tp.system.multi_suggester returns nothing on cancel when throw_on_cancel is not set", async () => {
        await resetVault("test/vault", {
            "templates/tp.system.multi_suggester.md": `<% await tp.system.multi_suggester(["Apple", "Banana"], ["apple", "banana"]) %>`,
        });
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

    it("tp.system.multi_suggester returns nothing on cancel when throw_on_cancel is false", async () => {
        await resetVault("test/vault", {
            "templates/tp.system.multi_suggester.md": `<% await tp.system.multi_suggester(["Apple", "Banana"], ["apple", "banana"], false) %>`,
        });
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
        await resetVault("test/vault", {
            "templates/tp.system.multi_suggester.md": `<%* try { await tp.system.multi_suggester(["Apple", "Banana"], ["apple", "banana"], true); } catch(e) { tR += "cancelled"; } %>`,
        });
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

    it("tp.system.multi_suggester shows error notice on cancel when throw_on_cancel is true and not caught", async () => {
        await resetVault("test/vault", {
            "templates/tp.system.multi_suggester.md": `<% await tp.system.multi_suggester(["Apple", "Banana"], ["apple", "banana"], true) %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.system.multi_suggester",
        );
        await MultiSuggesterModalPage.cancel();
        await WorkspacePage.waitForAllTemplatesExecuted();
        await NoticePage.expectCancelledPromptErrorNotice();
        await VaultPage.expectFileToHaveContent("Untitled.md", "");
    });

    it("tp.system.multi_suggester respects title", async () => {
        await resetVault("test/vault", {
            "templates/tp.system.multi_suggester.md": `<% await tp.system.multi_suggester(["Apple", "Banana", "Cherry"], ["apple", "banana", "cherry"], false, "Pick a fruit") %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.system.multi_suggester",
        );
        await MultiSuggesterModalPage.expectTitleToBe("Pick a fruit");
        await MultiSuggesterModalPage.save();
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "");
    });

    it("tp.system.multi_suggester respects limit", async () => {
        await resetVault("test/vault", {
            "templates/tp.system.multi_suggester.md": `<% await tp.system.multi_suggester(["Apple", "Banana", "Cherry"], ["apple", "banana", "cherry"], false, "", 2) %>`,
        });
        await EmptyStateViewPage.clickCreateNewNote();
        await WorkspacePage.expectActiveTabToHaveText("Untitled");
        await OpenInsertTemplateModalPage.open();
        await OpenInsertTemplateModalPage.selectSuggestionByName(
            "tp.system.multi_suggester",
        );
        await MultiSuggesterModalPage.expectSuggestionCountToBe(2);
        await MultiSuggesterModalPage.filterAndSelectByName("Cherry", "Cherry");
        await MultiSuggesterModalPage.save();
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent("Untitled.md", "cherry");
    });

    it("tp.system.multi_suggester pre-selects default values", async () => {
        await resetVault("test/vault", {
            "templates/tp.system.multi_suggester.md": `<% await tp.system.multi_suggester(["Apple", "Banana", "Cherry"], ["apple", "banana", "cherry"], false, "", undefined, ["banana"]) %>`,
        });
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

    //#endregion
});
