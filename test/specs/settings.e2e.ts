import TemplaterSettingsPage from "../page-objects/TemplaterSettingsPage.page";
import TemplaterDataFilePage from "../page-objects/TemplaterDataFile.page";
import ConfirmDangerousSettingModalPage from "../page-objects/ConfirmDangerousSettingModal.page";
import FileRegexTemplateModalPage from "../page-objects/FileRegexTemplateModal.page";
import FolderTemplateModalPage from "../page-objects/FolderTemplateModal.page";
import SystemCommandModalPage from "../page-objects/SystemCommandModal.page";
import StartupTemplateModalPage from "../page-objects/StartupTemplateModal.page";
import IgnoreFolderModalPage from "../page-objects/IgnoreFolderModal.page";
import TemplateHotkeyModalPage from "../page-objects/TemplateHotkeyModal.page";
import { resetVault } from "../utils/reset-vault";
import { IntellisenseRenderOption } from "../../src/settings/RenderSettings/IntellisenseRenderOption";
import type { TemplateHotkeyEntry } from "../../src/settings/TemplateHotkeys";

describe("Settings", () => {
    describe("Automatic jump to cursor", () => {
        it("enables auto_jump_to_cursor when toggled on", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(async ({ plugins }) => {
                plugins.templaterObsidian.settings.auto_jump_to_cursor = false;
                await plugins.templaterObsidian.save_settings();
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickToggleByName(
                "Automatic jump to cursor",
            );

            await TemplaterDataFilePage.expectSettingToEqual(
                "auto_jump_to_cursor",
                true,
            );
        });

        it("disables auto_jump_to_cursor when toggled off", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(async ({ plugins }) => {
                plugins.templaterObsidian.settings.auto_jump_to_cursor = true;
                await plugins.templaterObsidian.save_settings();
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickToggleByName(
                "Automatic jump to cursor",
            );

            await TemplaterDataFilePage.expectSettingToEqual(
                "auto_jump_to_cursor",
                false,
            );
        });
    });

    describe("Jump to note content after creating note", () => {
        it("enables jump_to_cursor_after_file_name when toggled on", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(async ({ plugins }) => {
                plugins.templaterObsidian.settings.jump_to_cursor_after_file_name =
                    false;
                await plugins.templaterObsidian.save_settings();
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickToggleByName(
                "Jump to note content after creating note",
            );

            await TemplaterDataFilePage.expectSettingToEqual(
                "jump_to_cursor_after_file_name",
                true,
            );
        });

        it("disables jump_to_cursor_after_file_name when toggled off", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(async ({ plugins }) => {
                plugins.templaterObsidian.settings.jump_to_cursor_after_file_name =
                    true;
                await plugins.templaterObsidian.save_settings();
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickToggleByName(
                "Jump to note content after creating note",
            );

            await TemplaterDataFilePage.expectSettingToEqual(
                "jump_to_cursor_after_file_name",
                false,
            );
        });
    });

    describe("Syntax highlighting on desktop", () => {
        it("disables syntax_highlighting when toggled off", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(async ({ plugins }) => {
                plugins.templaterObsidian.settings.syntax_highlighting = true;
                await plugins.templaterObsidian.save_settings();
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickToggleByName(
                "Syntax highlighting on desktop",
            );

            await TemplaterDataFilePage.expectSettingToEqual(
                "syntax_highlighting",
                false,
            );
        });

        it("enables syntax_highlighting when toggled on", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(async ({ plugins }) => {
                plugins.templaterObsidian.settings.syntax_highlighting = false;
                await plugins.templaterObsidian.save_settings();
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickToggleByName(
                "Syntax highlighting on desktop",
            );

            await TemplaterDataFilePage.expectSettingToEqual(
                "syntax_highlighting",
                true,
            );
        });
    });

    describe("Syntax highlighting on mobile", () => {
        it("enables syntax_highlighting_mobile when toggled on", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(async ({ plugins }) => {
                plugins.templaterObsidian.settings.syntax_highlighting_mobile = false;
                await plugins.templaterObsidian.save_settings();
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickToggleByName(
                "Syntax highlighting on mobile",
            );

            await TemplaterDataFilePage.expectSettingToEqual(
                "syntax_highlighting_mobile",
                true,
            );
        });

        it("disables syntax_highlighting_mobile when toggled off", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(async ({ plugins }) => {
                plugins.templaterObsidian.settings.syntax_highlighting_mobile = true;
                await plugins.templaterObsidian.save_settings();
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickToggleByName(
                "Syntax highlighting on mobile",
            );

            await TemplaterDataFilePage.expectSettingToEqual(
                "syntax_highlighting_mobile",
                false,
            );
        });
    });

    describe("Trigger Templater on new file creation", () => {
        it("blocks enabling trigger_on_file_creation until risks are acknowledged", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(({ app }) => {
                app.saveLocalStorage("templater-local-settings", {
                    trigger_on_file_creation: false,
                });
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickToggleByName(
                "Trigger Templater on new file creation",
            );
            await ConfirmDangerousSettingModalPage.waitForDisplayed();
            await ConfirmDangerousSettingModalPage.expectEnableBtnDisabled();

            await ConfirmDangerousSettingModalPage.checkUnderstandRisks();
            await ConfirmDangerousSettingModalPage.expectEnableBtnEnabled();

            // Clean up — dismiss without enabling
            await ConfirmDangerousSettingModalPage.clickCancel();
        });

        it("cancelling does not enable trigger_on_file_creation", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(({ app }) => {
                app.saveLocalStorage("templater-local-settings", {
                    trigger_on_file_creation: false,
                });
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickToggleByName(
                "Trigger Templater on new file creation",
            );
            await ConfirmDangerousSettingModalPage.waitForDisplayed();
            await ConfirmDangerousSettingModalPage.checkUnderstandRisks();
            await ConfirmDangerousSettingModalPage.clickCancel();

            await TemplaterDataFilePage.expectSettingToEqual(
                "trigger_on_file_creation",
                false,
            );
        });

        it("cancelling leaves toggle visually off", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(({ app }) => {
                app.saveLocalStorage("templater-local-settings", {
                    trigger_on_file_creation: false,
                });
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickToggleByName(
                "Trigger Templater on new file creation",
            );
            await ConfirmDangerousSettingModalPage.waitForDisplayed();
            await ConfirmDangerousSettingModalPage.checkUnderstandRisks();
            await ConfirmDangerousSettingModalPage.clickCancel();

            await TemplaterSettingsPage.expectToggleValueByName(
                "Trigger Templater on new file creation",
                false,
            );
        });

        it("confirming enables trigger_on_file_creation", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(({ app }) => {
                app.saveLocalStorage("templater-local-settings", {
                    trigger_on_file_creation: false,
                });
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickToggleByName(
                "Trigger Templater on new file creation",
            );
            await ConfirmDangerousSettingModalPage.waitForDisplayed();
            await ConfirmDangerousSettingModalPage.checkUnderstandRisks();
            await ConfirmDangerousSettingModalPage.clickEnable();

            await TemplaterDataFilePage.expectSettingToEqual(
                "trigger_on_file_creation",
                true,
            );
        });

        it("confirming shows toggle visually on", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(({ app }) => {
                app.saveLocalStorage("templater-local-settings", {
                    trigger_on_file_creation: false,
                });
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickToggleByName(
                "Trigger Templater on new file creation",
            );
            await ConfirmDangerousSettingModalPage.waitForDisplayed();
            await ConfirmDangerousSettingModalPage.checkUnderstandRisks();
            await ConfirmDangerousSettingModalPage.clickEnable();

            await TemplaterSettingsPage.expectToggleValueByName(
                "Trigger Templater on new file creation",
                true,
            );
        });

        it("enabling reveals Excluded folders and Template matching mode", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(({ app }) => {
                app.saveLocalStorage("templater-local-settings", {
                    trigger_on_file_creation: false,
                });
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickToggleByName(
                "Trigger Templater on new file creation",
            );
            await ConfirmDangerousSettingModalPage.waitForDisplayed();
            await ConfirmDangerousSettingModalPage.checkUnderstandRisks();
            await ConfirmDangerousSettingModalPage.clickEnable();

            // If Excluded folders is now visible, navigating to it will succeed
            await TemplaterSettingsPage.clickSettingRowByName(
                "Excluded folders",
            );
        });
    });

    describe("Template matching mode", () => {
        beforeEach(async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(async ({ app, plugins }) => {
                app.saveLocalStorage("templater-local-settings", {
                    trigger_on_file_creation: true,
                });
                plugins.templaterObsidian.settings.trigger_on_file_creation_mode =
                    "none";
                await plugins.templaterObsidian.save_settings();
            });
            await TemplaterSettingsPage.open();
        });

        it("updates trigger_on_file_creation_mode to 'folder' when Folder templates is selected", async () => {
            await TemplaterSettingsPage.selectDropdownOptionByName(
                "Template matching mode",
                "Folder templates",
            );

            await TemplaterDataFilePage.expectSettingToEqual(
                "trigger_on_file_creation_mode",
                "folder",
            );
        });

        it("updates trigger_on_file_creation_mode to 'regex' when File regex templates is selected", async () => {
            await TemplaterSettingsPage.selectDropdownOptionByName(
                "Template matching mode",
                "File regex templates",
            );

            await TemplaterDataFilePage.expectSettingToEqual(
                "trigger_on_file_creation_mode",
                "regex",
            );
        });
    });

    describe("Excluded folders", () => {
        it("adds a folder exclusion when submitted", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(async ({ app, plugins }) => {
                app.saveLocalStorage("templater-local-settings", {
                    trigger_on_file_creation: true,
                });
                plugins.templaterObsidian.settings.ignore_folders_on_creation =
                    [];
                await plugins.templaterObsidian.save_settings();
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickSettingRowByName(
                "Excluded folders",
            );
            await TemplaterSettingsPage.clickButtonWithText("Add folder");
            await IgnoreFolderModalPage.waitForDisplayed();
            await IgnoreFolderModalPage.setFolderPath("meta/templates");
            await IgnoreFolderModalPage.clickDone();

            await TemplaterDataFilePage.expectSettingToEqual(
                "ignore_folders_on_creation",
                [{ folder: "meta/templates" }],
            );
        });

        it("cancelling does not add a folder exclusion", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(async ({ app, plugins }) => {
                app.saveLocalStorage("templater-local-settings", {
                    trigger_on_file_creation: true,
                });
                plugins.templaterObsidian.settings.ignore_folders_on_creation =
                    [];
                await plugins.templaterObsidian.save_settings();
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickSettingRowByName(
                "Excluded folders",
            );
            await TemplaterSettingsPage.clickButtonWithText("Add folder");
            await IgnoreFolderModalPage.waitForDisplayed();
            await IgnoreFolderModalPage.setFolderPath("meta/templates");
            await IgnoreFolderModalPage.clickCancel();

            await TemplaterDataFilePage.expectSettingToEqual(
                "ignore_folders_on_creation",
                [],
            );
        });

        it("removes a folder exclusion when deleted", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(async ({ app, plugins }) => {
                app.saveLocalStorage("templater-local-settings", {
                    trigger_on_file_creation: true,
                });
                plugins.templaterObsidian.settings.ignore_folders_on_creation =
                    [{ folder: "meta/templates" }];
                await plugins.templaterObsidian.save_settings();
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickSettingRowByName(
                "Excluded folders",
            );
            await TemplaterSettingsPage.clickButtonWithText("Delete");

            await TemplaterDataFilePage.expectSettingToEqual(
                "ignore_folders_on_creation",
                [],
            );
        });
    });

    describe("Folder templates", () => {
        it("adds a folder template when folder and template are entered", async () => {
            await resetVault("test/vault", {
                "templates/default.md": "Default template",
            });
            await browser.executeObsidian(async ({ app, plugins }) => {
                app.saveLocalStorage("templater-local-settings", {
                    trigger_on_file_creation: true,
                });
                plugins.templaterObsidian.settings.trigger_on_file_creation_mode =
                    "folder";
                plugins.templaterObsidian.settings.folder_templates = [];
                await plugins.templaterObsidian.save_settings();
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickSettingRowByName(
                "Folder templates",
            );
            await TemplaterSettingsPage.clickButtonWithText(
                "Add folder template",
            );
            await FolderTemplateModalPage.waitForDisplayed();
            await FolderTemplateModalPage.setFolder("notes");
            await FolderTemplateModalPage.setTemplate("templates/default.md");
            await FolderTemplateModalPage.clickDone();

            await TemplaterDataFilePage.expectSettingToEqual(
                "folder_templates",
                [{ folder: "notes", template: "templates/default.md" }],
            );
        });

        it("shows an error when a duplicate folder is used", async () => {
            await resetVault("test/vault", {
                "templates/default.md": "Default template",
            });
            await browser.executeObsidian(async ({ app, plugins }) => {
                app.saveLocalStorage("templater-local-settings", {
                    trigger_on_file_creation: true,
                });
                plugins.templaterObsidian.settings.trigger_on_file_creation_mode =
                    "folder";
                plugins.templaterObsidian.settings.folder_templates = [
                    { folder: "notes", template: "templates/default.md" },
                ];
                await plugins.templaterObsidian.save_settings();
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickSettingRowByName(
                "Folder templates",
            );
            await TemplaterSettingsPage.clickButtonWithText(
                "Add folder template",
            );
            await FolderTemplateModalPage.waitForDisplayed();
            await FolderTemplateModalPage.setFolder("notes");
            await FolderTemplateModalPage.setTemplate("templates/default.md");
            await FolderTemplateModalPage.clickDone();

            await expect(
                FolderTemplateModalPage.errorMessageEl,
            ).toBeDisplayed();
        });

        it("removes a folder template when deleted", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(async ({ app, plugins }) => {
                app.saveLocalStorage("templater-local-settings", {
                    trigger_on_file_creation: true,
                });
                plugins.templaterObsidian.settings.trigger_on_file_creation_mode =
                    "folder";
                plugins.templaterObsidian.settings.folder_templates = [
                    { folder: "notes", template: "templates/default.md" },
                ];
                await plugins.templaterObsidian.save_settings();
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickSettingRowByName(
                "Folder templates",
            );
            await TemplaterSettingsPage.clickButtonWithText("Delete");

            await TemplaterDataFilePage.expectSettingToEqual(
                "folder_templates",
                [],
            );
        });

        it("edits a folder template when the list item is clicked", async () => {
            await resetVault("test/vault", {
                "templates/default.md": "Default template",
                "templates/other.md": "Other template",
            });
            await browser.executeObsidian(async ({ app, plugins }) => {
                app.saveLocalStorage("templater-local-settings", {
                    trigger_on_file_creation: true,
                });
                plugins.templaterObsidian.settings.trigger_on_file_creation_mode =
                    "folder";
                plugins.templaterObsidian.settings.folder_templates = [
                    { folder: "notes", template: "templates/default.md" },
                ];
                await plugins.templaterObsidian.save_settings();
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickSettingRowByName(
                "Folder templates",
            );
            await TemplaterSettingsPage.clickSettingRowByName("notes");
            await FolderTemplateModalPage.waitForDisplayed();
            await FolderTemplateModalPage.setFolder("journal");
            await FolderTemplateModalPage.setTemplate("templates/other.md");
            await FolderTemplateModalPage.clickDone();

            await TemplaterDataFilePage.expectSettingToEqual(
                "folder_templates",
                [{ folder: "journal", template: "templates/other.md" }],
            );
        });
    });

    describe("File regex templates", () => {
        it("adds a file regex template when regex and template are entered", async () => {
            await resetVault("test/vault", {
                "templates/default.md": "Default template",
            });
            await browser.executeObsidian(async ({ app, plugins }) => {
                app.saveLocalStorage("templater-local-settings", {
                    trigger_on_file_creation: true,
                });
                plugins.templaterObsidian.settings.trigger_on_file_creation_mode =
                    "regex";
                plugins.templaterObsidian.settings.file_templates = [];
                await plugins.templaterObsidian.save_settings();
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickSettingRowByName(
                "File regex templates",
            );
            await TemplaterSettingsPage.clickButtonWithText(
                "Add file regex template",
            );
            await FileRegexTemplateModalPage.waitForDisplayed();
            await FileRegexTemplateModalPage.setRegex("notes/.*\\.md");
            await FileRegexTemplateModalPage.setTemplate(
                "templates/default.md",
            );
            await FileRegexTemplateModalPage.clickDone();

            await TemplaterDataFilePage.expectSettingToEqual("file_templates", [
                { regex: "notes/.*\\.md", template: "templates/default.md" },
            ]);
        });

        it("edits a file regex template when the list item is clicked", async () => {
            await resetVault("test/vault", {
                "templates/default.md": "Default template",
                "templates/other.md": "Other template",
            });
            await browser.executeObsidian(async ({ app, plugins }) => {
                app.saveLocalStorage("templater-local-settings", {
                    trigger_on_file_creation: true,
                });
                plugins.templaterObsidian.settings.trigger_on_file_creation_mode =
                    "regex";
                plugins.templaterObsidian.settings.file_templates = [
                    {
                        regex: "notes/.*\\.md",
                        template: "templates/default.md",
                    },
                ];
                await plugins.templaterObsidian.save_settings();
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickSettingRowByName(
                "File regex templates",
            );
            await TemplaterSettingsPage.clickSettingRowByName("notes/.*\\.md");
            await FileRegexTemplateModalPage.waitForDisplayed();
            await FileRegexTemplateModalPage.setRegex("journal/.*\\.md");
            await FileRegexTemplateModalPage.setTemplate("templates/other.md");
            await FileRegexTemplateModalPage.clickDone();

            await TemplaterDataFilePage.expectSettingToEqual("file_templates", [
                { regex: "journal/.*\\.md", template: "templates/other.md" },
            ]);
        });
    });

    describe("Enable startup templates", () => {
        it("blocks enabling startup templates until risks are acknowledged", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(({ app }) => {
                app.saveLocalStorage("templater-local-settings", {
                    enable_startup_templates: false,
                });
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickToggleByName(
                "Enable startup templates",
            );
            await ConfirmDangerousSettingModalPage.waitForDisplayed();
            await ConfirmDangerousSettingModalPage.expectEnableBtnDisabled();

            await ConfirmDangerousSettingModalPage.checkUnderstandRisks();
            await ConfirmDangerousSettingModalPage.expectEnableBtnEnabled();

            // Clean up — dismiss without enabling
            await ConfirmDangerousSettingModalPage.clickCancel();
        });

        it("cancelling does not enable startup templates", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(({ app }) => {
                app.saveLocalStorage("templater-local-settings", {
                    enable_startup_templates: false,
                });
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickToggleByName(
                "Enable startup templates",
            );
            await ConfirmDangerousSettingModalPage.waitForDisplayed();
            await ConfirmDangerousSettingModalPage.checkUnderstandRisks();
            await ConfirmDangerousSettingModalPage.clickCancel();

            await TemplaterDataFilePage.expectSettingToEqual(
                "enable_startup_templates",
                false,
            );
        });

        it("cancelling leaves toggle visually off", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(({ app }) => {
                app.saveLocalStorage("templater-local-settings", {
                    enable_startup_templates: false,
                });
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickToggleByName(
                "Enable startup templates",
            );
            await ConfirmDangerousSettingModalPage.waitForDisplayed();
            await ConfirmDangerousSettingModalPage.checkUnderstandRisks();
            await ConfirmDangerousSettingModalPage.clickCancel();

            await TemplaterSettingsPage.expectToggleValueByName(
                "Enable startup templates",
                false,
            );
        });

        it("confirming enables startup templates", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(({ app }) => {
                app.saveLocalStorage("templater-local-settings", {
                    enable_startup_templates: false,
                });
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickToggleByName(
                "Enable startup templates",
            );
            await ConfirmDangerousSettingModalPage.waitForDisplayed();
            await ConfirmDangerousSettingModalPage.checkUnderstandRisks();
            await ConfirmDangerousSettingModalPage.clickEnable();

            await TemplaterDataFilePage.expectSettingToEqual(
                "enable_startup_templates",
                true,
            );
        });

        it("confirming shows toggle visually on", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(({ app }) => {
                app.saveLocalStorage("templater-local-settings", {
                    enable_startup_templates: false,
                });
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickToggleByName(
                "Enable startup templates",
            );
            await ConfirmDangerousSettingModalPage.waitForDisplayed();
            await ConfirmDangerousSettingModalPage.checkUnderstandRisks();
            await ConfirmDangerousSettingModalPage.clickEnable();

            await TemplaterSettingsPage.expectToggleValueByName(
                "Enable startup templates",
                true,
            );
        });
    });

    describe("Startup templates", () => {
        it("adds a startup template path when submitted", async () => {
            await resetVault("test/vault", {
                "templates/daily.md": "Daily note",
            });
            await browser.executeObsidian(async ({ app, plugins }) => {
                app.saveLocalStorage("templater-local-settings", {
                    enable_startup_templates: true,
                });
                plugins.templaterObsidian.settings.startup_templates = [];
                await plugins.templaterObsidian.save_settings();
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickSettingRowByName(
                "Startup templates",
            );
            await TemplaterSettingsPage.clickButtonWithText(
                "Add new startup template",
            );
            await StartupTemplateModalPage.waitForDisplayed();
            await StartupTemplateModalPage.setTemplatePath(
                "templates/daily.md",
            );
            await StartupTemplateModalPage.clickDone();

            await TemplaterDataFilePage.expectSettingToEqual(
                "startup_templates",
                ["templates/daily.md"],
            );
        });

        it("cancelling does not add a startup template", async () => {
            await resetVault("test/vault", {
                "templates/daily.md": "Daily note",
            });
            await browser.executeObsidian(async ({ app, plugins }) => {
                app.saveLocalStorage("templater-local-settings", {
                    enable_startup_templates: true,
                });
                plugins.templaterObsidian.settings.startup_templates = [];
                await plugins.templaterObsidian.save_settings();
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickSettingRowByName(
                "Startup templates",
            );
            await TemplaterSettingsPage.clickButtonWithText(
                "Add new startup template",
            );
            await StartupTemplateModalPage.waitForDisplayed();
            await StartupTemplateModalPage.setTemplatePath(
                "templates/daily.md",
            );
            await StartupTemplateModalPage.clickCancel();

            await TemplaterDataFilePage.expectSettingToEqual(
                "startup_templates",
                [],
            );
        });

        it("removes a startup template when deleted", async () => {
            await resetVault("test/vault", {
                "templates/daily.md": "Daily note",
            });
            await browser.executeObsidian(async ({ app, plugins }) => {
                app.saveLocalStorage("templater-local-settings", {
                    enable_startup_templates: true,
                });
                plugins.templaterObsidian.settings.startup_templates = [
                    "templates/daily.md",
                ];
                await plugins.templaterObsidian.save_settings();
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickSettingRowByName(
                "Startup templates",
            );
            await TemplaterSettingsPage.clickButtonWithText("Delete");

            await TemplaterDataFilePage.expectSettingToEqual(
                "startup_templates",
                [],
            );
        });
    });

    describe("Template hotkeys", () => {
        const INSERT_DAILY_COMMAND_ID = "templater-obsidian:templates/daily.md";
        const CREATE_DAILY_COMMAND_ID =
            "templater-obsidian:create-templates/daily.md";

        async function seedHotkeys(entries: TemplateHotkeyEntry[]) {
            await browser.executeObsidian(async ({ plugins }, entries) => {
                plugins.templaterObsidian.settings.enabled_templates_hotkeys =
                    entries;
                plugins.templaterObsidian.command_handler.sync_template_hotkeys();
                await plugins.templaterObsidian.save_settings();
            }, entries);
        }

        async function expectCommandRegistered(id: string, expected: boolean) {
            await browser.waitUntil(async () => {
                const registered = await browser.executeObsidian(
                    ({ app }, id) => id in app.commands.commands,
                    id,
                );
                return registered === expected;
            });
        }

        it("adds a template hotkey with both commands when submitted", async () => {
            await resetVault("test/vault", {
                "templates/daily.md": "Daily note",
            });
            await seedHotkeys([]);
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickSettingRowByName(
                "Template hotkeys",
            );
            await TemplaterSettingsPage.clickButtonWithText(
                "Add template hotkey",
            );
            await TemplateHotkeyModalPage.waitForDisplayed();
            await TemplateHotkeyModalPage.setTemplatePath("templates/daily.md");
            await TemplateHotkeyModalPage.clickDone();

            await TemplaterDataFilePage.expectSettingToEqual(
                "enabled_templates_hotkeys",
                ["templates/daily.md"],
            );
            await expectCommandRegistered(INSERT_DAILY_COMMAND_ID, true);
            await expectCommandRegistered(CREATE_DAILY_COMMAND_ID, true);
        });

        it("rejects a template that already has a hotkey", async () => {
            await resetVault("test/vault", {
                "templates/daily.md": "Daily note",
            });
            await seedHotkeys(["templates/daily.md"]);
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickSettingRowByName(
                "Template hotkeys",
            );
            await TemplaterSettingsPage.clickButtonWithText(
                "Add template hotkey",
            );
            await TemplateHotkeyModalPage.waitForDisplayed();
            await TemplateHotkeyModalPage.setTemplatePath("templates/daily.md");
            await TemplateHotkeyModalPage.clickDoneExpectingError();

            await expect(TemplateHotkeyModalPage.errorEl).toHaveText(
                "This template already has a hotkey",
            );
            await TemplateHotkeyModalPage.clickCancel();
            await TemplaterDataFilePage.expectSettingToEqual(
                "enabled_templates_hotkeys",
                ["templates/daily.md"],
            );
        });

        it("cancelling does not add a template hotkey", async () => {
            await resetVault("test/vault", {
                "templates/daily.md": "Daily note",
            });
            await seedHotkeys([]);
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickSettingRowByName(
                "Template hotkeys",
            );
            await TemplaterSettingsPage.clickButtonWithText(
                "Add template hotkey",
            );
            await TemplateHotkeyModalPage.waitForDisplayed();
            await TemplateHotkeyModalPage.setTemplatePath("templates/daily.md");
            await TemplateHotkeyModalPage.clickCancel();

            await TemplaterDataFilePage.expectSettingToEqual(
                "enabled_templates_hotkeys",
                [],
            );
        });

        it("adds an insert-only hotkey when the create toggle is turned off", async () => {
            await resetVault("test/vault", {
                "templates/daily.md": "Daily note",
            });
            await seedHotkeys([]);
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickSettingRowByName(
                "Template hotkeys",
            );
            await TemplaterSettingsPage.clickButtonWithText(
                "Add template hotkey",
            );
            await TemplateHotkeyModalPage.waitForDisplayed();
            await TemplateHotkeyModalPage.setTemplatePath("templates/daily.md");
            await TemplateHotkeyModalPage.clickToggle("Create command");
            await TemplateHotkeyModalPage.clickDone();

            await TemplaterDataFilePage.expectSettingToEqual(
                "enabled_templates_hotkeys",
                [
                    {
                        template: "templates/daily.md",
                        insert_enabled: true,
                        create_enabled: false,
                    },
                ],
            );
            await expectCommandRegistered(INSERT_DAILY_COMMAND_ID, true);
            await expectCommandRegistered(CREATE_DAILY_COMMAND_ID, false);
        });

        it("rejects a hotkey with no commands enabled", async () => {
            await resetVault("test/vault", {
                "templates/daily.md": "Daily note",
            });
            await seedHotkeys([]);
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickSettingRowByName(
                "Template hotkeys",
            );
            await TemplaterSettingsPage.clickButtonWithText(
                "Add template hotkey",
            );
            await TemplateHotkeyModalPage.waitForDisplayed();
            await TemplateHotkeyModalPage.setTemplatePath("templates/daily.md");
            await TemplateHotkeyModalPage.clickToggle("Insert command");
            await TemplateHotkeyModalPage.clickToggle("Create command");
            await TemplateHotkeyModalPage.clickDoneExpectingError();

            await expect(TemplateHotkeyModalPage.errorEl).toHaveText(
                "At least one command must be enabled",
            );
            await TemplateHotkeyModalPage.clickCancel();
            await TemplaterDataFilePage.expectSettingToEqual(
                "enabled_templates_hotkeys",
                [],
            );
        });

        it("removes both commands when a template hotkey is deleted", async () => {
            await resetVault("test/vault", {
                "templates/daily.md": "Daily note",
            });
            await seedHotkeys(["templates/daily.md"]);
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickSettingRowByName(
                "Template hotkeys",
            );
            await TemplaterSettingsPage.clickButtonWithText("Delete");

            await TemplaterDataFilePage.expectSettingToEqual(
                "enabled_templates_hotkeys",
                [],
            );
            await expectCommandRegistered(INSERT_DAILY_COMMAND_ID, false);
            await expectCommandRegistered(CREATE_DAILY_COMMAND_ID, false);
        });

        it("unregisters only the create command when it is turned off from the row", async () => {
            await resetVault("test/vault", {
                "templates/daily.md": "Daily note",
            });
            await seedHotkeys(["templates/daily.md"]);
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickSettingRowByName(
                "Template hotkeys",
            );
            await TemplaterSettingsPage.clickSettingRowByName(
                "templates/daily.md",
            );
            await TemplateHotkeyModalPage.waitForDisplayed();
            await TemplateHotkeyModalPage.clickToggle("Create command");
            await TemplateHotkeyModalPage.clickDone();

            await TemplaterDataFilePage.expectSettingToEqual(
                "enabled_templates_hotkeys",
                [
                    {
                        template: "templates/daily.md",
                        insert_enabled: true,
                        create_enabled: false,
                    },
                ],
            );
            await expectCommandRegistered(INSERT_DAILY_COMMAND_ID, true);
            await expectCommandRegistered(CREATE_DAILY_COMMAND_ID, false);
        });

        it("stores the plain template path again when both commands are re-enabled", async () => {
            await resetVault("test/vault", {
                "templates/daily.md": "Daily note",
            });
            await seedHotkeys([
                {
                    template: "templates/daily.md",
                    insert_enabled: true,
                    create_enabled: false,
                },
            ]);
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickSettingRowByName(
                "Template hotkeys",
            );
            await TemplaterSettingsPage.clickSettingRowByName(
                "templates/daily.md",
            );
            await TemplateHotkeyModalPage.waitForDisplayed();
            await TemplateHotkeyModalPage.expectToggleValue(
                "Create command",
                false,
            );
            await TemplateHotkeyModalPage.clickToggle("Create command");
            await TemplateHotkeyModalPage.clickDone();

            await TemplaterDataFilePage.expectSettingToEqual(
                "enabled_templates_hotkeys",
                ["templates/daily.md"],
            );
            await expectCommandRegistered(CREATE_DAILY_COMMAND_ID, true);
        });

        it("keeps the existing entry editable without a duplicate error", async () => {
            await resetVault("test/vault", {
                "templates/daily.md": "Daily note",
            });
            await seedHotkeys(["templates/daily.md"]);
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickSettingRowByName(
                "Template hotkeys",
            );
            await TemplaterSettingsPage.clickSettingRowByName(
                "templates/daily.md",
            );
            await TemplateHotkeyModalPage.waitForDisplayed();
            await TemplateHotkeyModalPage.expectToggleValue(
                "Insert command",
                true,
            );
            await TemplateHotkeyModalPage.clickDone();

            await TemplaterDataFilePage.expectSettingToEqual(
                "enabled_templates_hotkeys",
                ["templates/daily.md"],
            );
        });

        it("registers commands for a mix of string and object entries", async () => {
            await resetVault("test/vault", {
                "templates/daily.md": "Daily note",
                "templates/weekly.md": "Weekly note",
            });
            await seedHotkeys([
                "templates/daily.md",
                { template: "templates/weekly.md", create_enabled: false },
            ]);

            await expectCommandRegistered(INSERT_DAILY_COMMAND_ID, true);
            await expectCommandRegistered(CREATE_DAILY_COMMAND_ID, true);
            await expectCommandRegistered(
                "templater-obsidian:templates/weekly.md",
                true,
            );
            await expectCommandRegistered(
                "templater-obsidian:create-templates/weekly.md",
                false,
            );
        });
    });

    describe("User scripts", () => {
        it("shows newly created script after vault event", async () => {
            await resetVault("test/vault");
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickSettingRowByName("User scripts");

            await browser.executeObsidian(async ({ app }) => {
                await app.vault.create(
                    "user scripts/my_script.js",
                    "module.exports = function() { return 'hello'; }",
                );
            });

            await expect(
                TemplaterSettingsPage.settingsContentEl.$(
                    ".setting-item-name=tp.user.my_script",
                ),
            ).toBeDisplayed();
        });
    });

    describe("User script intellisense", () => {
        it("updates intellisense_render when a different option is selected", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(async ({ plugins }, initial) => {
                plugins.templaterObsidian.settings.intellisense_render =
                    initial;
                await plugins.templaterObsidian.save_settings();
            }, IntellisenseRenderOption.RenderDescriptionParameterReturn);
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.selectDropdownOptionByName(
                "User script intellisense",
                "Turn off intellisense",
            );

            await TemplaterDataFilePage.expectSettingToEqual(
                "intellisense_render",
                IntellisenseRenderOption.Off,
            );
        });
    });

    describe("Enable user system command functions", () => {
        it("blocks enabling system commands until risks are acknowledged", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(({ app }) => {
                app.saveLocalStorage("templater-local-settings", {
                    enable_system_commands: false,
                });
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickToggleByName(
                "Enable user system command functions",
            );
            await ConfirmDangerousSettingModalPage.waitForDisplayed();
            await ConfirmDangerousSettingModalPage.expectEnableBtnDisabled();

            await ConfirmDangerousSettingModalPage.checkUnderstandRisks();
            await ConfirmDangerousSettingModalPage.expectEnableBtnEnabled();

            // Clean up — dismiss without enabling
            await ConfirmDangerousSettingModalPage.clickCancel();
        });

        it("cancelling does not enable system commands", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(({ app }) => {
                app.saveLocalStorage("templater-local-settings", {
                    enable_system_commands: false,
                });
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickToggleByName(
                "Enable user system command functions",
            );
            await ConfirmDangerousSettingModalPage.waitForDisplayed();
            await ConfirmDangerousSettingModalPage.checkUnderstandRisks();
            await ConfirmDangerousSettingModalPage.clickCancel();

            await TemplaterDataFilePage.expectSettingToEqual(
                "enable_system_commands",
                false,
            );
        });

        it("cancelling leaves toggle visually off", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(({ app }) => {
                app.saveLocalStorage("templater-local-settings", {
                    enable_system_commands: false,
                });
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickToggleByName(
                "Enable user system command functions",
            );
            await ConfirmDangerousSettingModalPage.waitForDisplayed();
            await ConfirmDangerousSettingModalPage.checkUnderstandRisks();
            await ConfirmDangerousSettingModalPage.clickCancel();

            await TemplaterSettingsPage.expectToggleValueByName(
                "Enable user system command functions",
                false,
            );
        });

        it("confirming enables system commands", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(({ app }) => {
                app.saveLocalStorage("templater-local-settings", {
                    enable_system_commands: false,
                });
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickToggleByName(
                "Enable user system command functions",
            );
            await ConfirmDangerousSettingModalPage.waitForDisplayed();
            await ConfirmDangerousSettingModalPage.checkUnderstandRisks();
            await ConfirmDangerousSettingModalPage.clickEnable();

            await TemplaterDataFilePage.expectSettingToEqual(
                "enable_system_commands",
                true,
            );
        });

        it("confirming shows toggle visually on", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(({ app }) => {
                app.saveLocalStorage("templater-local-settings", {
                    enable_system_commands: false,
                });
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickToggleByName(
                "Enable user system command functions",
            );
            await ConfirmDangerousSettingModalPage.waitForDisplayed();
            await ConfirmDangerousSettingModalPage.checkUnderstandRisks();
            await ConfirmDangerousSettingModalPage.clickEnable();

            await TemplaterSettingsPage.expectToggleValueByName(
                "Enable user system command functions",
                true,
            );
        });
    });

    describe("Shell binary location", () => {
        it("updates shell_path when changed", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(async ({ app, plugins }) => {
                app.saveLocalStorage("templater-local-settings", {
                    enable_system_commands: true,
                });
                plugins.templaterObsidian.settings.shell_path = "";
                await plugins.templaterObsidian.save_settings();
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.setTextInputByName(
                "Shell binary location",
                "/bin/zsh",
            );

            await TemplaterDataFilePage.expectSettingToEqual(
                "shell_path",
                "/bin/zsh",
            );
        });
    });

    describe("User system command functions", () => {
        it("shows validation error when function name is empty", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(async ({ app, plugins }) => {
                app.saveLocalStorage("templater-local-settings", {
                    enable_system_commands: true,
                });
                plugins.templaterObsidian.settings.templates_pairs = [];
                await plugins.templaterObsidian.save_settings();
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickSettingRowByName(
                "User system command functions",
            );
            await TemplaterSettingsPage.clickButtonWithText(
                "Add new user function",
            );
            await SystemCommandModalPage.waitForDisplayed();
            await SystemCommandModalPage.clickDone();

            await expect(SystemCommandModalPage.errorMessageEl).toBeDisplayed();
        });

        it("adds a new user function when a valid name and command are submitted", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(async ({ app, plugins }) => {
                app.saveLocalStorage("templater-local-settings", {
                    enable_system_commands: true,
                });
                plugins.templaterObsidian.settings.templates_pairs = [];
                await plugins.templaterObsidian.save_settings();
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickSettingRowByName(
                "User system command functions",
            );
            await TemplaterSettingsPage.clickButtonWithText(
                "Add new user function",
            );
            await SystemCommandModalPage.waitForDisplayed();
            await SystemCommandModalPage.setFunctionName("myFunc");
            await SystemCommandModalPage.setSystemCommand("echo hello");
            await SystemCommandModalPage.clickDone();

            await TemplaterDataFilePage.expectSettingToEqual(
                "templates_pairs",
                [["myFunc", "echo hello"]],
            );
        });

        it("shows validation error when function name is a duplicate", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(async ({ app, plugins }) => {
                app.saveLocalStorage("templater-local-settings", {
                    enable_system_commands: true,
                });
                plugins.templaterObsidian.settings.templates_pairs = [
                    ["existingFunc", "echo existing"],
                ];
                await plugins.templaterObsidian.save_settings();
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickSettingRowByName(
                "User system command functions",
            );
            await TemplaterSettingsPage.clickButtonWithText(
                "Add new user function",
            );
            await SystemCommandModalPage.waitForDisplayed();
            await SystemCommandModalPage.setFunctionName("existingFunc");
            await SystemCommandModalPage.setSystemCommand("echo duplicate");
            await SystemCommandModalPage.clickDone();

            await expect(SystemCommandModalPage.errorMessageEl).toBeDisplayed();
        });

        it("removes a user function when deleted", async () => {
            await resetVault("test/vault", {});
            await browser.executeObsidian(async ({ app, plugins }) => {
                app.saveLocalStorage("templater-local-settings", {
                    enable_system_commands: true,
                });
                plugins.templaterObsidian.settings.templates_pairs = [
                    ["myFunc", "echo hello"],
                ];
                await plugins.templaterObsidian.save_settings();
            });
            await TemplaterSettingsPage.open();

            await TemplaterSettingsPage.clickSettingRowByName(
                "User system command functions",
            );
            await TemplaterSettingsPage.clickButtonWithText("Delete");

            await TemplaterDataFilePage.expectSettingToEqual(
                "templates_pairs",
                [],
            );
        });
    });
});
