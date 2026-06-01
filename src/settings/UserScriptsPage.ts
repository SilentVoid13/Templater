import TemplaterPlugin from "main";
import {
    normalizePath,
    Setting,
    SettingGroup,
    SettingPage,
    TFile,
} from "obsidian";
import { TemplaterSettingTab } from "settings/Settings";
import { errorWrapperSync } from "utils/Error";
import { get_tfiles_from_folder } from "utils/Utils";

export class UserScriptsPage extends SettingPage {
    pluginSettingTab: TemplaterSettingTab;
    plugin: TemplaterPlugin;
    userScripts: TFile[] = [];

    constructor(
        pluginSettingTab: TemplaterSettingTab,
        plugin: TemplaterPlugin,
    ) {
        super();
        this.pluginSettingTab = pluginSettingTab;
        this.plugin = plugin;
    }

    loadUserScripts() {
        const files = errorWrapperSync(
            () =>
                get_tfiles_from_folder(
                    this.plugin.app,
                    this.plugin.settings.user_scripts_folder,
                ),
            `User scripts folder doesn't exist`,
        );
        this.userScripts = Array.isArray(files)
            ? files.filter((file) => file.extension === "js")
            : [];
    }

    openUserScriptsFolderInDefaultApp() {
        const path = this.plugin.settings.user_scripts_folder;
        if (path) {
            this.plugin.app.openWithDefaultApp(normalizePath(path));
        }
    }

    display(): void {
        this.containerEl.empty();
        this.loadUserScripts();

        if (this.plugin.settings.user_scripts_folder) {
            new Setting(this.containerEl)
                .setHeading()
                .addExtraButton((cb) => {
                    cb.setIcon("folder")
                        .setTooltip("Open user scripts folder")
                        .onClick(() =>
                            this.openUserScriptsFolderInDefaultApp(),
                        );
                });
        }

        if (this.userScripts.length === 0) {
            new Setting(this.containerEl)
                .setName(
                    (() => {
                        const desc = createFragment();
                        if (!this.plugin.settings.user_scripts_folder) {
                            desc.append(
                                "No user scripts folder set. Please set the user scripts folder on the previous page.",
                                desc.createEl("br"),
                                desc.createEl("br"),
                            );
                        }
                        desc.append(
                            "User scripts are JavaScript files that are loaded as CommonJS modules. You can then call these functions from your templates using ",
                            desc.createEl("code", {
                                text: "<% tp.user.file_name() %>",
                            }),
                        );
                        return desc;
                    })(),
                )
                .setClass("mod-empty-state");
            return;
        }

        const group = new SettingGroup(this.containerEl).addClass("mod-list");

        this.userScripts.forEach((script) => {
            group.addSetting((setting) => {
                setting.setName(`tp.user.${script.basename}`);
            });
        });
    }
}
