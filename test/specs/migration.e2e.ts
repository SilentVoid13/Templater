import { obsidianPage } from "wdio-obsidian-service";
import TemplaterDataFilePage from "../page-objects/TemplaterDataFile.page";
import NoticePage from "../page-objects/Notice.page";
import { resetVault } from "../utils/reset-vault";

async function seedLegacyDataAndMigrate(legacy: Record<string, unknown>) {
    await browser.executeObsidian(async ({ plugins }, data) => {
        await plugins.templaterObsidian.saveData(data);
        await plugins.templaterObsidian.load_settings();
    }, legacy);
}

describe("Migration", () => {
    describe("enable_folder_templates", () => {
        it("migrates to trigger_on_file_creation_mode 'folder'", async () => {
            await resetVault("test/vault", {});
            await seedLegacyDataAndMigrate({ enable_folder_templates: true });

            await TemplaterDataFilePage.expectSettingToEqual(
                "trigger_on_file_creation_mode",
                "folder",
            );
        });

        it("removes enable_folder_templates key from data.json", async () => {
            await resetVault("test/vault", {});
            await seedLegacyDataAndMigrate({ enable_folder_templates: true });

            await browser.waitUntil(async () => {
                const raw = await obsidianPage.read(
                    // eslint-disable-next-line obsidianmd/hardcoded-config-path -- test only
                    ".obsidian/plugins/templater-obsidian/data.json",
                );
                const data = JSON.parse(raw) as Record<string, unknown>;
                return !("enable_folder_templates" in data);
            });
        });
    });

    describe("enable_file_templates", () => {
        it("migrates to trigger_on_file_creation_mode 'regex'", async () => {
            await resetVault("test/vault", {});
            await seedLegacyDataAndMigrate({ enable_file_templates: true });

            await TemplaterDataFilePage.expectSettingToEqual(
                "trigger_on_file_creation_mode",
                "regex",
            );
        });

        it("removes enable_file_templates key from data.json", async () => {
            await resetVault("test/vault", {});
            await seedLegacyDataAndMigrate({ enable_file_templates: true });

            await browser.waitUntil(async () => {
                const raw = await obsidianPage.read(
                    // eslint-disable-next-line obsidianmd/hardcoded-config-path -- test only
                    ".obsidian/plugins/templater-obsidian/data.json",
                );
                const data = JSON.parse(raw) as Record<string, unknown>;
                return !("enable_file_templates" in data);
            });
        });
    });

    describe("empty placeholder array entries", () => {
        it("strips empty entries from all array settings", async () => {
            await resetVault("test/vault", {});
            await seedLegacyDataAndMigrate({
                folder_templates: [{ folder: "", template: "" }],
                file_templates: [{ regex: "some-regex", template: "" }],
                startup_templates: [""],
                enabled_templates_hotkeys: [""],
                ignore_folders_on_creation: [{ folder: "" }],
                templates_pairs: [["", ""]],
            });

            await TemplaterDataFilePage.expectSettingToEqual(
                "folder_templates",
                [],
            );
            await TemplaterDataFilePage.expectSettingToEqual(
                "file_templates",
                [],
            );
            await TemplaterDataFilePage.expectSettingToEqual(
                "startup_templates",
                [],
            );
            await TemplaterDataFilePage.expectSettingToEqual(
                "enabled_templates_hotkeys",
                [],
            );
            await TemplaterDataFilePage.expectSettingToEqual(
                "ignore_folders_on_creation",
                [],
            );
            await TemplaterDataFilePage.expectSettingToEqual(
                "templates_pairs",
                [],
            );
        });

        it("preserves non-empty folder_templates entries alongside empty ones", async () => {
            await resetVault("test/vault", {});
            await seedLegacyDataAndMigrate({
                folder_templates: [
                    { folder: "", template: "" },
                    { folder: "notes", template: "templates/default.md" },
                ],
            });

            await TemplaterDataFilePage.expectSettingToEqual("folder_templates", [
                { folder: "notes", template: "templates/default.md" },
            ]);
        });

        it("preserves non-empty file_templates entries alongside empty ones", async () => {
            await resetVault("test/vault", {});
            await seedLegacyDataAndMigrate({
                file_templates: [
                    { regex: "some-regex", template: "" },
                    { regex: "daily/.*", template: "templates/daily.md" },
                ],
            });

            await TemplaterDataFilePage.expectSettingToEqual("file_templates", [
                { regex: "daily/.*", template: "templates/daily.md" },
            ]);
        });
    });

    describe("security-sensitive settings", () => {
        it("does not migrate trigger_on_file_creation to localStorage", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(({ app }) => {
                app.saveLocalStorage("templater-local-settings", {
                    trigger_on_file_creation: false,
                });
            });
            await seedLegacyDataAndMigrate({ trigger_on_file_creation: true });

            await TemplaterDataFilePage.expectSettingToEqual(
                "trigger_on_file_creation",
                false,
            );
        });

        it("does not migrate enable_system_commands to localStorage", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(({ app }) => {
                app.saveLocalStorage("templater-local-settings", {
                    enable_system_commands: false,
                });
            });
            await seedLegacyDataAndMigrate({ enable_system_commands: true });

            await TemplaterDataFilePage.expectSettingToEqual(
                "enable_system_commands",
                false,
            );
        });

        it("does not migrate any security-sensitive setting when all three are present", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(({ app }) => {
                app.saveLocalStorage("templater-local-settings", {
                    trigger_on_file_creation: false,
                    enable_system_commands: false,
                    enable_startup_templates: false,
                });
            });
            await seedLegacyDataAndMigrate({
                trigger_on_file_creation: true,
                enable_system_commands: true,
                startup_templates: ["templates/startup.md"],
            });

            await TemplaterDataFilePage.expectSettingToEqual(
                "trigger_on_file_creation",
                false,
            );
            await TemplaterDataFilePage.expectSettingToEqual(
                "enable_system_commands",
                false,
            );
            await TemplaterDataFilePage.expectSettingToEqual(
                "enable_startup_templates",
                false,
            );
        });

        it("shows a notice naming trigger_on_file_creation when it was true", async () => {
            await resetVault("test/vault", {});
            await seedLegacyDataAndMigrate({ trigger_on_file_creation: true });

            await NoticePage.expectMigrationNotice(["'Trigger on file creation'"]);
        });

        it("shows a notice naming enable_system_commands when it was true", async () => {
            await resetVault("test/vault", {});
            await seedLegacyDataAndMigrate({ enable_system_commands: true });

            await NoticePage.expectMigrationNotice(["'Enable system commands'"]);
        });

        it("shows a notice naming enable_startup_templates when startup_templates was non-empty", async () => {
            await resetVault("test/vault", {});
            await seedLegacyDataAndMigrate({
                startup_templates: ["templates/startup.md"],
            });

            await NoticePage.expectMigrationNotice(["'Enable startup templates'"]);
        });

        it("lists all affected settings in a single notice", async () => {
            await resetVault("test/vault", {});
            await seedLegacyDataAndMigrate({
                trigger_on_file_creation: true,
                enable_system_commands: true,
                startup_templates: ["templates/startup.md"],
            });

            await NoticePage.expectMigrationNotice([
                "'Trigger on file creation'",
                "'Enable system commands'",
                "'Enable startup templates'",
            ]);
        });

        it("does not show a notice when no security-sensitive settings are present", async () => {
            await resetVault("test/vault", {});
            await seedLegacyDataAndMigrate({ enable_folder_templates: true });

            await NoticePage.expectNoErrorNotice();
        });

        it("does not show a notice when trigger_on_file_creation was false", async () => {
            await resetVault("test/vault", {});
            await seedLegacyDataAndMigrate({ trigger_on_file_creation: false });

            await NoticePage.expectNoErrorNotice();
        });

        it("removes trigger_on_file_creation from data.json even when it was false", async () => {
            await resetVault("test/vault", {});
            await seedLegacyDataAndMigrate({ trigger_on_file_creation: false });

            await browser.waitUntil(async () => {
                const raw = await obsidianPage.read(
                    // eslint-disable-next-line obsidianmd/hardcoded-config-path -- test only
                    ".obsidian/plugins/templater-obsidian/data.json",
                );
                const data = JSON.parse(raw) as Record<string, unknown>;
                return !("trigger_on_file_creation" in data);
            });
        });

        it("removes enable_system_commands from data.json after migration", async () => {
            await resetVault("test/vault", {});
            await seedLegacyDataAndMigrate({ enable_system_commands: true });

            await browser.waitUntil(async () => {
                const raw = await obsidianPage.read(
                    // eslint-disable-next-line obsidianmd/hardcoded-config-path -- test only
                    ".obsidian/plugins/templater-obsidian/data.json",
                );
                const data = JSON.parse(raw) as Record<string, unknown>;
                return !("enable_system_commands" in data);
            });
        });

        it("does not show a notice when startup_templates contains only empty placeholders", async () => {
            await resetVault("test/vault", {});
            await seedLegacyDataAndMigrate({ startup_templates: [""] });

            await NoticePage.expectNoErrorNotice();
        });
    });

    describe("idempotency", () => {
        it("does not show a notice on second load after migration", async () => {
            await resetVault("test/vault", {});
            await seedLegacyDataAndMigrate({ trigger_on_file_creation: true });
            await NoticePage.dismissAll();

            // Run load_settings() a second time — legacy keys are gone from data.json
            await browser.executeObsidian(async ({ plugins }) => {
                await plugins.templaterObsidian.load_settings();
            });

            await NoticePage.expectNoErrorNotice();
        });

        it("does not change trigger_on_file_creation_mode on second load", async () => {
            await resetVault("test/vault", {});
            await seedLegacyDataAndMigrate({ enable_folder_templates: true });

            await browser.executeObsidian(async ({ plugins }) => {
                await plugins.templaterObsidian.load_settings();
            });

            await TemplaterDataFilePage.expectSettingToEqual(
                "trigger_on_file_creation_mode",
                "folder",
            );
        });
    });
});
