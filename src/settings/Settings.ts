import { ButtonComponent, PluginSettingTab, Setting } from "obsidian";
import { errorWrapperSync, TemplaterError } from "utils/Error";
import { FolderSuggest } from "./suggesters/FolderSuggester";
import { FileSuggest, FileSuggestMode } from "./suggesters/FileSuggester";
import TemplaterPlugin from "main";
import { arraymove, get_tfiles_from_folder } from "utils/Utils";
import { log_error } from "utils/Log";
import { HEART, PAYPAL } from "utils/Constants";

export interface FolderTemplate {
    folder: string;
    template: string;
}

export const DEFAULT_SETTINGS: Settings = {
    command_timeout: 5,
    templates_folder: "",
    templates_pairs: [["", ""]],
    trigger_on_file_creation: false,
    auto_jump_to_cursor: false,
    enable_system_commands: false,
    shell_path: "",
    user_scripts_folder: "",
    enable_folder_templates: true,
    folder_templates: [{ folder: "", template: "" }],
    syntax_highlighting: true,
    syntax_highlighting_mobile: false,
    enabled_templates_hotkeys: [""],
    startup_templates: [""],
    enable_ribbon_icon: true,
};

export interface Settings {
    command_timeout: number;
    templates_folder: string;
    templates_pairs: Array<[string, string]>;
    trigger_on_file_creation: boolean;
    auto_jump_to_cursor: boolean;
    enable_system_commands: boolean;
    shell_path: string;
    user_scripts_folder: string;
    enable_folder_templates: boolean;
    folder_templates: Array<FolderTemplate>;
    syntax_highlighting: boolean;
    syntax_highlighting_mobile: boolean;
    enabled_templates_hotkeys: Array<string>;
    startup_templates: Array<string>;
    enable_ribbon_icon: boolean;
}

export class TemplaterSettingTab extends PluginSettingTab {
    constructor(private plugin: TemplaterPlugin) {
        super(app, plugin);
    }

    display(): void {
        this.containerEl.empty();

        this.add_general_setting_header();
        this.add_template_folder_setting();
        this.add_internal_functions_setting();
        this.add_syntax_highlighting_settings();
        this.add_auto_jump_to_cursor();
        this.add_trigger_on_new_file_creation_setting();
        this.add_ribbon_icon_setting();
        this.add_templates_hotkeys_setting();
        if (this.plugin.settings.trigger_on_file_creation) {
            this.add_folder_templates_setting();
        }
        this.add_startup_templates_setting();
        this.add_user_script_functions_setting();
        this.add_user_system_command_functions_setting();
        this.add_donating_setting();
    }

    add_general_setting_header(): void {
        this.containerEl.createEl("h2", { text: "General Settings" });
    }

    add_template_folder_setting(): void {
        new Setting(this.containerEl)
            .setName("Template folder location")
            .setDesc("Files in this folder will be available as templates.")
            .addSearch((cb) => {
                new FolderSuggest(cb.inputEl);
                cb.setPlaceholder("Example: folder1/folder2")
                    .setValue(this.plugin.settings.templates_folder)
                    .onChange((new_folder) => {
                        this.plugin.settings.templates_folder = new_folder;
                        this.plugin.save_settings();
                    });
                // @ts-ignore
                cb.containerEl.addClass("templater_search");
            });
    }

    add_internal_functions_setting(): void {
        const desc = document.createDocumentFragment();
        desc.append(
            "Templater provides multiples predefined variables / functions that you can use.",
            desc.createEl("br"),
            "Check the ",
            desc.createEl("a", {
                href: "https://silentvoid13.github.io/Templater/",
                text: "documentation",
            }),
            " to get a list of all the available internal variables / functions."
        );

        new Setting(this.containerEl)
            .setName("Internal Variables and Functions")
            .setDesc(desc);
    }

    add_syntax_highlighting_settings(): void {
        const desktopDesc = document.createDocumentFragment();
        desktopDesc.append(
            "Adds syntax highlighting for Templater commands in edit mode."
        );

        const mobileDesc = document.createDocumentFragment();
        mobileDesc.append(
            "Adds syntax highlighting for Templater commands in edit mode on " +
            "mobile. Use with caution: this may break live preview on mobile " +
            "platforms."
        );

        new Setting(this.containerEl)
            .setName("Syntax Highlighting on Desktop")
            .setDesc(desktopDesc)
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.syntax_highlighting)
                    .onChange((syntax_highlighting) => {
                        this.plugin.settings.syntax_highlighting =
                            syntax_highlighting;
                        this.plugin.save_settings();
                        this.plugin.event_handler.update_syntax_highlighting();
                    });
            });

        new Setting(this.containerEl)
            .setName("Syntax Highlighting on Mobile")
            .setDesc(mobileDesc)
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.syntax_highlighting_mobile)
                    .onChange((syntax_highlighting_mobile) => {
                        this.plugin.settings.syntax_highlighting_mobile =
                            syntax_highlighting_mobile;
                        this.plugin.save_settings();
                        this.plugin.event_handler.update_syntax_highlighting();
                    });
            });
    }

    add_auto_jump_to_cursor(): void {
        const desc = document.createDocumentFragment();
        desc.append(
            "Automatically triggers ",
            desc.createEl("code", { text: "tp.file.cursor" }),
            " after inserting a template.",
            desc.createEl("br"),
            "You can also set a hotkey to manually trigger ",
            desc.createEl("code", { text: "tp.file.cursor" }),
            "."
        );

        new Setting(this.containerEl)
            .setName("Automatic jump to cursor")
            .setDesc(desc)
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.auto_jump_to_cursor)
                    .onChange((auto_jump_to_cursor) => {
                        this.plugin.settings.auto_jump_to_cursor =
                            auto_jump_to_cursor;
                        this.plugin.save_settings();
                    });
            });
    }

    add_trigger_on_new_file_creation_setting(): void {
        const desc = document.createDocumentFragment();
        desc.append(
            "Templater will listen for the new file creation event, and replace every command it finds in the new file's content.",
            desc.createEl("br"),
            "This makes Templater compatible with other plugins like the Daily note core plugin, Calendar plugin, Review plugin, Note refactor plugin, ...",
            desc.createEl("br"),
            desc.createEl("b", {
                text: "Warning: ",
            }),
            "This can be dangerous if you create new files with unknown / unsafe content on creation. Make sure that every new file's content is safe on creation."
        );

        new Setting(this.containerEl)
            .setName("Trigger Templater on new file creation")
            .setDesc(desc)
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.trigger_on_file_creation)
                    .onChange((trigger_on_file_creation) => {
                        this.plugin.settings.trigger_on_file_creation =
                            trigger_on_file_creation;
                        this.plugin.save_settings();
                        this.plugin.event_handler.update_trigger_file_on_creation();
                        // Force refresh
                        this.display();
                    });
            });
    }

    add_ribbon_icon_setting(): void {
        const desc = document.createDocumentFragment();
        desc.append(
            "Show Templater icon in sidebar ribbon, allowing you to quickly use templates anywhere."
        );

        new Setting(this.containerEl)
            .setName("Show icon in sidebar")
            .setDesc(desc)
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.enable_ribbon_icon)
                    .onChange((enable_ribbon_icon) => {
                        this.plugin.settings.enable_ribbon_icon =
                            enable_ribbon_icon;
                        this.plugin.save_settings();
                        if (this.plugin.settings.enable_ribbon_icon) {
                            this.plugin
                                .addRibbonIcon(
                                    "templater-icon",
                                    "Templater",
                                    async () => {
                                        this.plugin.fuzzy_suggester.insert_template();
                                    }
                                )
                                .setAttribute("id", "rb-templater-icon");
                        } else {
                            document
                                .getElementById("rb-templater-icon")
                                ?.remove();
                        }
                    });
            });
    }

    add_templates_hotkeys_setting(): void {
        this.containerEl.createEl("h2", { text: "Template Hotkeys" });

        const desc = document.createDocumentFragment();
        desc.append(
            "Template Hotkeys allows you to bind a template to a hotkey."
        );

        new Setting(this.containerEl).setDesc(desc);

        this.plugin.settings.enabled_templates_hotkeys.forEach(
            (template, index) => {
                const s = new Setting(this.containerEl)
                    .addSearch((cb) => {
                        new FileSuggest(
                            cb.inputEl,
                            this.plugin,
                            FileSuggestMode.TemplateFiles
                        );
                        cb.setPlaceholder("Example: folder1/template_file")
                            .setValue(template)
                            .onChange((new_template) => {
                                if (
                                    new_template &&
                                    this.plugin.settings.enabled_templates_hotkeys.contains(
                                        new_template
                                    )
                                ) {
                                    log_error(
                                        new TemplaterError(
                                            "This template is already bound to a hotkey"
                                        )
                                    );
                                    return;
                                }
                                this.plugin.command_handler.add_template_hotkey(
                                    this.plugin.settings
                                        .enabled_templates_hotkeys[index],
                                    new_template
                                );
                                this.plugin.settings.enabled_templates_hotkeys[
                                    index
                                ] = new_template;
                                this.plugin.save_settings();
                            });
                        // @ts-ignore
                        cb.containerEl.addClass("templater_search");
                    })
                    .addExtraButton((cb) => {
                        cb.setIcon("any-key")
                            .setTooltip("Configure Hotkey")
                            .onClick(() => {
                                // TODO: Replace with future "official" way to do this
                                // @ts-ignore
                                app.setting.openTabById("hotkeys");
                                // @ts-ignore
                                const tab = app.setting.activeTab;
                                tab.searchInputEl.value = "Templater: Insert";
                                tab.updateHotkeyVisibility();
                            });
                    })
                    .addExtraButton((cb) => {
                        cb.setIcon("up-chevron-glyph")
                            .setTooltip("Move up")
                            .onClick(() => {
                                arraymove(
                                    this.plugin.settings
                                        .enabled_templates_hotkeys,
                                    index,
                                    index - 1
                                );
                                this.plugin.save_settings();
                                this.display();
                            });
                    })
                    .addExtraButton((cb) => {
                        cb.setIcon("down-chevron-glyph")
                            .setTooltip("Move down")
                            .onClick(() => {
                                arraymove(
                                    this.plugin.settings
                                        .enabled_templates_hotkeys,
                                    index,
                                    index + 1
                                );
                                this.plugin.save_settings();
                                this.display();
                            });
                    })
                    .addExtraButton((cb) => {
                        cb.setIcon("cross")
                            .setTooltip("Delete")
                            .onClick(() => {
                                this.plugin.command_handler.remove_template_hotkey(
                                    this.plugin.settings
                                        .enabled_templates_hotkeys[index]
                                );
                                this.plugin.settings.enabled_templates_hotkeys.splice(
                                    index,
                                    1
                                );
                                this.plugin.save_settings();
                                // Force refresh
                                this.display();
                            });
                    });
                s.infoEl.remove();
            }
        );

        new Setting(this.containerEl).addButton((cb) => {
            cb.setButtonText("Add new hotkey for template")
                .setCta()
                .onClick(() => {
                    this.plugin.settings.enabled_templates_hotkeys.push("");
                    this.plugin.save_settings();
                    // Force refresh
                    this.display();
                });
        });
    }

    add_folder_templates_setting(): void {
        this.containerEl.createEl("h2", { text: "Folder Templates" });

        const descHeading = document.createDocumentFragment();
        descHeading.append(
            "Folder Templates are triggered when a new ",
            descHeading.createEl("strong", { text: "empty " }),
            "file is created in a given folder.",
            descHeading.createEl("br"),
            "Templater will fill the empty file with the specified template.",
            descHeading.createEl("br"),
            "The deepest match is used. A global default template would be defined on the root ",
            descHeading.createEl("code", { text: "/" }),
            "."
        );

        new Setting(this.containerEl).setDesc(descHeading);

        const descUseNewFileTemplate = document.createDocumentFragment();
        descUseNewFileTemplate.append(
            "When enabled Templater will make use of the folder templates defined below."
        );

        new Setting(this.containerEl)
            .setName("Enable Folder Templates")
            .setDesc(descUseNewFileTemplate)
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.enable_folder_templates)
                    .onChange((use_new_file_templates) => {
                        this.plugin.settings.enable_folder_templates =
                            use_new_file_templates;
                        this.plugin.save_settings();
                        // Force refresh
                        this.display();
                    });
            });

        if (!this.plugin.settings.enable_folder_templates) {
            return;
        }

        new Setting(this.containerEl)
            .setName("Add New")
            .setDesc("Add new folder template")
            .addButton((button: ButtonComponent) => {
                button
                    .setTooltip("Add additional folder template")
                    .setButtonText("+")
                    .setCta()
                    .onClick(() => {
                        this.plugin.settings.folder_templates.push({
                            folder: "",
                            template: "",
                        });
                        this.plugin.save_settings();
                        this.display();
                    });
            });

        this.plugin.settings.folder_templates.forEach(
            (folder_template, index) => {
                const s = new Setting(this.containerEl)
                    .addSearch((cb) => {
                        new FolderSuggest(cb.inputEl);
                        cb.setPlaceholder("Folder")
                            .setValue(folder_template.folder)
                            .onChange((new_folder) => {
                                if (
                                    new_folder &&
                                    this.plugin.settings.folder_templates.some(
                                        (e) => e.folder == new_folder
                                    )
                                ) {
                                    log_error(
                                        new TemplaterError(
                                            "This folder already has a template associated with it"
                                        )
                                    );
                                    return;
                                }

                                this.plugin.settings.folder_templates[
                                    index
                                ].folder = new_folder;
                                this.plugin.save_settings();
                            });
                        // @ts-ignore
                        cb.containerEl.addClass("templater_search");
                    })
                    .addSearch((cb) => {
                        new FileSuggest(
                            cb.inputEl,
                            this.plugin,
                            FileSuggestMode.TemplateFiles
                        );
                        cb.setPlaceholder("Template")
                            .setValue(folder_template.template)
                            .onChange((new_template) => {
                                this.plugin.settings.folder_templates[
                                    index
                                ].template = new_template;
                                this.plugin.save_settings();
                            });
                        // @ts-ignore
                        cb.containerEl.addClass("templater_search");
                    })
                    .addExtraButton((cb) => {
                        cb.setIcon("up-chevron-glyph")
                            .setTooltip("Move up")
                            .onClick(() => {
                                arraymove(
                                    this.plugin.settings.folder_templates,
                                    index,
                                    index - 1
                                );
                                this.plugin.save_settings();
                                this.display();
                            });
                    })
                    .addExtraButton((cb) => {
                        cb.setIcon("down-chevron-glyph")
                            .setTooltip("Move down")
                            .onClick(() => {
                                arraymove(
                                    this.plugin.settings.folder_templates,
                                    index,
                                    index + 1
                                );
                                this.plugin.save_settings();
                                this.display();
                            });
                    })
                    .addExtraButton((cb) => {
                        cb.setIcon("cross")
                            .setTooltip("Delete")
                            .onClick(() => {
                                this.plugin.settings.folder_templates.splice(
                                    index,
                                    1
                                );
                                this.plugin.save_settings();
                                this.display();
                            });
                    });
                s.infoEl.remove();
            }
        );
    }

    add_startup_templates_setting(): void {
        this.containerEl.createEl("h2", { text: "Startup Templates" });

        const desc = document.createDocumentFragment();
        desc.append(
            "Startup Templates are templates that will get executed once when Templater starts.",
            desc.createEl("br"),
            "These templates won't output anything.",
            desc.createEl("br"),
            "This can be useful to set up templates adding hooks to obsidian events for example."
        );

        new Setting(this.containerEl).setDesc(desc);

        this.plugin.settings.startup_templates.forEach((template, index) => {
            const s = new Setting(this.containerEl)
                .addSearch((cb) => {
                    new FileSuggest(
                        cb.inputEl,
                        this.plugin,
                        FileSuggestMode.TemplateFiles
                    );
                    cb.setPlaceholder("Example: folder1/template_file")
                        .setValue(template)
                        .onChange((new_template) => {
                            if (
                                new_template &&
                                this.plugin.settings.startup_templates.contains(
                                    new_template
                                )
                            ) {
                                log_error(
                                    new TemplaterError(
                                        "This startup template already exist"
                                    )
                                );
                                return;
                            }
                            this.plugin.settings.startup_templates[index] =
                                new_template;
                            this.plugin.save_settings();
                        });
                    // @ts-ignore
                    cb.containerEl.addClass("templater_search");
                })
                .addExtraButton((cb) => {
                    cb.setIcon("cross")
                        .setTooltip("Delete")
                        .onClick(() => {
                            this.plugin.settings.startup_templates.splice(
                                index,
                                1
                            );
                            this.plugin.save_settings();
                            // Force refresh
                            this.display();
                        });
                });
            s.infoEl.remove();
        });

        new Setting(this.containerEl).addButton((cb) => {
            cb.setButtonText("Add new startup template")
                .setCta()
                .onClick(() => {
                    this.plugin.settings.startup_templates.push("");
                    this.plugin.save_settings();
                    // Force refresh
                    this.display();
                });
        });
    }

    add_user_script_functions_setting(): void {
        this.containerEl.createEl("h2", { text: "User Script Functions" });

        let desc = document.createDocumentFragment();
        desc.append(
            "All JavaScript files in this folder will be loaded as CommonJS modules, to import custom user functions.",
            desc.createEl("br"),
            "The folder needs to be accessible from the vault.",
            desc.createEl("br"),
            "Check the ",
            desc.createEl("a", {
                href: "https://silentvoid13.github.io/Templater/",
                text: "documentation",
            }),
            " for more information."
        );

        new Setting(this.containerEl)
            .setName("Script files folder location")
            .setDesc(desc)
            .addSearch((cb) => {
                new FolderSuggest(cb.inputEl);
                cb.setPlaceholder("Example: folder1/folder2")
                    .setValue(this.plugin.settings.user_scripts_folder)
                    .onChange((new_folder) => {
                        this.plugin.settings.user_scripts_folder = new_folder;
                        this.plugin.save_settings();
                    });
                // @ts-ignore
                cb.containerEl.addClass("templater_search");
            });

        desc = document.createDocumentFragment();
        let name: string;
        if (!this.plugin.settings.user_scripts_folder) {
            name = "No User Scripts folder set";
        } else {
            const files = errorWrapperSync(
                () =>
                    get_tfiles_from_folder(
                        this.plugin.settings.user_scripts_folder
                    ),
                `User Scripts folder doesn't exist`
            );
            if (!files || files.length === 0) {
                name = "No User Scripts detected";
            } else {
                let count = 0;
                for (const file of files) {
                    if (file.extension === "js") {
                        count++;
                        desc.append(
                            desc.createEl("li", {
                                text: `tp.user.${file.basename}`,
                            })
                        );
                    }
                }
                name = `Detected ${count} User Script(s)`;
            }
        }

        new Setting(this.containerEl)
            .setName(name)
            .setDesc(desc)
            .addExtraButton((extra) => {
                extra
                    .setIcon("sync")
                    .setTooltip("Refresh")
                    .onClick(() => {
                        // Force refresh
                        this.display();
                    });
            });
    }

    add_user_system_command_functions_setting(): void {
        let desc = document.createDocumentFragment();
        desc.append(
            "Allows you to create user functions linked to system commands.",
            desc.createEl("br"),
            desc.createEl("b", {
                text: "Warning: ",
            }),
            "It can be dangerous to execute arbitrary system commands from untrusted sources. Only run system commands that you understand, from trusted sources."
        );

        this.containerEl.createEl("h2", {
            text: "User System Command Functions",
        });

        new Setting(this.containerEl)
            .setName("Enable User System Command Functions")
            .setDesc(desc)
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.enable_system_commands)
                    .onChange((enable_system_commands) => {
                        this.plugin.settings.enable_system_commands =
                            enable_system_commands;
                        this.plugin.save_settings();
                        // Force refresh
                        this.display();
                    });
            });

        if (this.plugin.settings.enable_system_commands) {
            new Setting(this.containerEl)
                .setName("Timeout")
                .setDesc("Maximum timeout in seconds for a system command.")
                .addText((text) => {
                    text.setPlaceholder("Timeout")
                        .setValue(
                            this.plugin.settings.command_timeout.toString()
                        )
                        .onChange((new_value) => {
                            const new_timeout = Number(new_value);
                            if (isNaN(new_timeout)) {
                                log_error(
                                    new TemplaterError(
                                        "Timeout must be a number"
                                    )
                                );
                                return;
                            }
                            this.plugin.settings.command_timeout = new_timeout;
                            this.plugin.save_settings();
                        });
                });

            desc = document.createDocumentFragment();
            desc.append(
                "Full path to the shell binary to execute the command with.",
                desc.createEl("br"),
                "This setting is optional and will default to the system's default shell if not specified.",
                desc.createEl("br"),
                "You can use forward slashes ('/') as path separators on all platforms if in doubt."
            );
            new Setting(this.containerEl)
                .setName("Shell binary location")
                .setDesc(desc)
                .addText((text) => {
                    text.setPlaceholder("Example: /bin/bash, ...")
                        .setValue(this.plugin.settings.shell_path)
                        .onChange((shell_path) => {
                            this.plugin.settings.shell_path = shell_path;
                            this.plugin.save_settings();
                        });
                });

            let i = 1;
            this.plugin.settings.templates_pairs.forEach((template_pair) => {
                const div = this.containerEl.createEl("div");
                div.addClass("templater_div");

                const title = this.containerEl.createEl("h4", {
                    text: "User Function n°" + i,
                });
                title.addClass("templater_title");

                const setting = new Setting(this.containerEl)
                    .addExtraButton((extra) => {
                        extra
                            .setIcon("cross")
                            .setTooltip("Delete")
                            .onClick(() => {
                                const index =
                                    this.plugin.settings.templates_pairs.indexOf(
                                        template_pair
                                    );
                                if (index > -1) {
                                    this.plugin.settings.templates_pairs.splice(
                                        index,
                                        1
                                    );
                                    this.plugin.save_settings();
                                    // Force refresh
                                    this.display();
                                }
                            });
                    })
                    .addText((text) => {
                        const t = text
                            .setPlaceholder("Function name")
                            .setValue(template_pair[0])
                            .onChange((new_value) => {
                                const index =
                                    this.plugin.settings.templates_pairs.indexOf(
                                        template_pair
                                    );
                                if (index > -1) {
                                    this.plugin.settings.templates_pairs[
                                        index
                                    ][0] = new_value;
                                    this.plugin.save_settings();
                                }
                            });
                        t.inputEl.addClass("templater_template");

                        return t;
                    })
                    .addTextArea((text) => {
                        const t = text
                            .setPlaceholder("System Command")
                            .setValue(template_pair[1])
                            .onChange((new_cmd) => {
                                const index =
                                    this.plugin.settings.templates_pairs.indexOf(
                                        template_pair
                                    );
                                if (index > -1) {
                                    this.plugin.settings.templates_pairs[
                                        index
                                    ][1] = new_cmd;
                                    this.plugin.save_settings();
                                }
                            });

                        t.inputEl.setAttr("rows", 2);
                        t.inputEl.addClass("templater_cmd");

                        return t;
                    });

                setting.infoEl.remove();

                div.appendChild(title);
                div.appendChild(this.containerEl.lastChild as Node);

                i += 1;
            });

            const div = this.containerEl.createEl("div");
            div.addClass("templater_div2");

            const setting = new Setting(this.containerEl).addButton(
                (button) => {
                    button
                        .setButtonText("Add New User Function")
                        .setCta()
                        .onClick(() => {
                            this.plugin.settings.templates_pairs.push(["", ""]);
                            this.plugin.save_settings();
                            // Force refresh
                            this.display();
                        });
                }
            );
            setting.infoEl.remove();

            div.appendChild(this.containerEl.lastChild as Node);
        }
    }

    add_donating_setting(): void {
        const s = new Setting(this.containerEl)
            .setName("Donate")
            .setDesc(
                "If you like this Plugin, consider donating to support continued development."
            )


        const a1 = document.createElement("a");
        a1.setAttribute("href", "https://github.com/sponsors/silentvoid13");
        a1.addClass("templater_donating");
        const img1 = document.createElement("img");
        img1.src = "https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86";
        a1.appendChild(img1);

        const a2 = document.createElement("a");
        a2.setAttribute("href", "https://www.paypal.com/donate?hosted_button_id=U2SRGAFYXT32Q");
        a2.addClass("templater_donating");
        const img2 = document.createElement("img");
        img2.src = "https://img.shields.io/badge/paypal-silentvoid13-yellow?style=social&logo=paypal";
        a2.appendChild(img2);

        s.settingEl.appendChild(a1);
        s.settingEl.appendChild(a2);
    }
}
