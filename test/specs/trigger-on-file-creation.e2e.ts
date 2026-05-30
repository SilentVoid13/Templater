import VaultPage from "../page-objects/Vault.page";
import WorkspacePage from "../page-objects/Workspace.page";
import { resetVault } from "../utils/reset-vault";

describe("trigger_on_file_creation", () => {
    it("processes template syntax in files created in vault when enabled", async () => {
        await resetVault("test/vault", {});
        await browser.executeObsidian(({ app }) => {
            app.saveLocalStorage("templater-local-settings", {
                trigger_on_file_creation: true,
            });
        });
        await browser.executeObsidian(async ({ app }) => {
            await app.vault.create(
                "notes/trigger-test.md",
                "<% tp.file.title %>",
            );
        });
        await VaultPage.expectFileToHaveContent(
            "notes/trigger-test.md",
            "trigger-test",
        );
    });

    it("does not process template syntax in files created when disabled", async () => {
        await resetVault("test/vault", {});
        await browser.executeObsidian(({ app }) => {
            app.saveLocalStorage("templater-local-settings", {
                trigger_on_file_creation: false,
            });
        });
        await browser.executeObsidian(async ({ app }) => {
            await app.vault.create(
                "notes/no-trigger-test.md",
                "<% tp.file.title %>",
            );
        });
        // Wait longer than the 300ms delay inside on_file_creation, then confirm
        // Templater has finished (no-op when disabled) before reading content
        // eslint-disable-next-line wdio/no-pause
        await browser.pause(600);
        await WorkspacePage.waitForAllTemplatesExecuted();
        await VaultPage.expectFileToHaveContent(
            "notes/no-trigger-test.md",
            "<% tp.file.title %>",
        );
    });
});
