import {
    obsidianPage,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ObsidianBrowserCommands,
} from "wdio-obsidian-service";
import { Key } from "webdriverio";
import NoticePage from "../page-objects/Notice.page";
import TemplaterSettingsPage from "../page-objects/TemplaterSettingsPage.page";

/**
 * Updates the vault by modifying files in place without reloading Obsidian. Can be used to reset the vault back to
 * its original state or to "switch" to an entirely different vault without rebooting Obsidian
 *
 * This will only update regular vault files, it won't touch anything under `.obsidian`, and it won't reset any
 * Obsidian config or plugin settings. But if all you need is to reset the vault files, this can be used as a faster
 * alternative to {@link ObsidianBrowserCommands.reloadObsidian | reloadObsidian}.
 *
 * You'll often want to combine resetVault with something like this to reset your plugin's configuration as well:
 * ```ts
 * await browser.executeObsidian(async ({plugins}, settings) => {
 *     Object.assign(plugins.myPlugin.settings, settings);
 *     await plugins.myPlugin.saveSettings();
 * }, {...});
 * ```
 *
 * If no vault is passed, it resets the vault back to the oringal vault opened by the tests. You can also pass a
 * path to a different vault, and it will replace the current files with the files of that vault (similar to an
 * "rsync"). Or, instead of passing a vault path you can pass an object mapping vault file paths to file content.
 * E.g.
 * ```ts
 * obsidianPage.resetVault({
 *     'path/in/vault.md': "Hello World",
 * })
 * ```
 *
 * You can also pass multiple vaults and objects, and they will be merged. This can be useful if you want to add a
 * few small modifications to the base vault. e.g:
 * ```ts
 * obsidianPage.resetVault('./path/to/vault', {
 *    "books/leviathan-wakes.md": "...",
 * })
 * ```
 */
export async function resetVault(
    ...vaults: Parameters<typeof obsidianPage.resetVault>
) {
    await obsidianPage.resetVault(...vaults);
    await obsidianPage.loadWorkspaceLayout("empty");
    await NoticePage.dismissAll();
    await TemplaterSettingsPage.close();
    // Close any open modals/menus
    await browser.keys(Key.Escape);
    await browser.keys(Key.Escape);
}
