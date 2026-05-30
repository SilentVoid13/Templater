import { LocalSettings } from "settings/LocalSettings";
import { Settings } from "settings/Settings";
import { obsidianPage } from "wdio-obsidian-service";

// Keys stored in localStorage under "templater-local-settings"
const LOCAL_SETTING_KEYS = new Set([
    "trigger_on_file_creation",
    "enable_startup_templates",
    "enable_system_commands",
]);

class TemplaterDataFile {
    async expectSettingToEqual(
        key: keyof Settings | keyof LocalSettings,
        expected: unknown,
    ) {
        if (LOCAL_SETTING_KEYS.has(key)) {
            await this.expectLocalSettingToEqual(
                key as keyof LocalSettings,
                expected,
            );
        } else {
            await this.expectSyncedSettingToEqual(
                key as keyof Settings,
                expected,
            );
        }
    }

    private async expectLocalSettingToEqual(
        key: keyof LocalSettings,
        expected: unknown,
    ) {
        await browser.waitUntil(async () => {
            const local = await browser.executeObsidian(({ app }) =>
                app.loadLocalStorage("templater-local-settings"),
            );
            return JSON.stringify(local?.[key]) === JSON.stringify(expected);
        });
    }

    private async expectSyncedSettingToEqual(
        key: keyof Settings,
        expected: unknown,
    ) {
        await browser.waitUntil(async () => {
            const raw = await obsidianPage.read(
                // eslint-disable-next-line obsidianmd/hardcoded-config-path -- This is for tests only
                ".obsidian/plugins/templater-obsidian/data.json",
            );
            const data = JSON.parse(raw) as Partial<Settings>;
            return JSON.stringify(data[key]) === JSON.stringify(expected);
        });
    }
}

export default new TemplaterDataFile();
