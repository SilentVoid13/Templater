import TemplaterPlugin from "main";
import { Setting, SettingGroup, SettingPage, TFile } from "obsidian";
import { TemplaterSettingTab } from "settings/Settings";
import { errorWrapperSync } from "utils/Error";
import { get_tfiles_from_folder } from "utils/Utils";

export class TemplateHotkeysPage extends SettingPage {
    pluginSettingTab: TemplaterSettingTab;
    plugin: TemplaterPlugin;
    mappedTemplates: TFile[] = [];
    unmappedTemplates: TFile[] = [];

    constructor(
        pluginSettingTab: TemplaterSettingTab,
        plugin: TemplaterPlugin,
    ) {
        super();
        this.pluginSettingTab = pluginSettingTab;
        this.plugin = plugin;
    }

    loadTemplates() {
        this.mappedTemplates = [];
        this.unmappedTemplates = [];

        const allTemplates = errorWrapperSync(
            () =>
                get_tfiles_from_folder(
                    this.plugin.app,
                    this.plugin.settings.templates_folder,
                ),
            "Templates folder doesn't exist",
        );

        if (Array.isArray(allTemplates)) {
            allTemplates.forEach((file) => {
                if (
                    this.plugin.settings.enabled_templates_hotkeys.includes(
                        file.path,
                    )
                ) {
                    this.mappedTemplates.push(file);
                } else {
                    this.unmappedTemplates.push(file);
                }
            });
        }
    }

    display(): void {
        this.containerEl.empty();
        this.loadTemplates();

        new Setting(this.containerEl).setHeading().addExtraButton((cb) => {
            cb.setIcon("sync")
                .setTooltip("Reload templates")
                .onClick(() => {
                    this.display();
                });
        });

        if (!this.plugin.settings.templates_folder) {
            new Setting(this.containerEl)
                .setName(
                    "No templates folder set. Please set the template folder location on the previous page.",
                )
                .setClass("mod-empty-state");
            return;
        }

        if (
            this.mappedTemplates.length === 0 &&
            this.unmappedTemplates.length === 0
        ) {
            new Setting(this.containerEl)
                .setName("No templates found in the templates folder.")
                .setClass("mod-empty-state");
            return;
        }

        if (this.mappedTemplates.length > 0) {
            const boundGroup = new SettingGroup(this.containerEl)
                .setHeading("Bound templates")
                .addClass("mod-list");

            this.mappedTemplates.forEach((template) => {
                boundGroup.addSetting((setting) => {
                    setting.setName(template.path).addExtraButton((cb) => {
                        cb.setIcon("x")
                            .setTooltip("Delete")
                            .onClick(() => {
                                this.plugin.command_handler.remove_template_hotkey(
                                    template.path,
                                );
                                const idx =
                                    this.plugin.settings.enabled_templates_hotkeys.indexOf(
                                        template.path,
                                    );
                                if (idx !== -1) {
                                    this.plugin.settings.enabled_templates_hotkeys.splice(
                                        idx,
                                        1,
                                    );
                                }
                                void this.plugin.save_settings();
                                this.display();
                            });
                    });
                });
            });
        }

        if (this.unmappedTemplates.length > 0) {
            const unboundGroup = new SettingGroup(this.containerEl)
                .setHeading("Unbound templates")
                .addClass("mod-list");

            this.unmappedTemplates.forEach((template) => {
                unboundGroup.addSetting((setting) => {
                    setting.setName(template.path).setAction?.(() => {
                        this.plugin.command_handler.add_template_hotkey(
                            null,
                            template.path,
                        );
                        this.plugin.settings.enabled_templates_hotkeys.push(
                            template.path,
                        );
                        void this.plugin.save_settings();
                        this.display();
                    });
                });
            });
        }
    }
}
