import { App, PluginSettingTab, Setting, TFile } from "obsidian";
import { errorWrapperSync, TemplaterError } from "Error";
import { FolderSuggest } from 'suggesters/FolderSuggester';
import { FileSuggest, FileSuggestMode } from 'suggesters/FileSuggester';
import TemplaterPlugin from './main';
import { get_tfiles_from_folder } from 'Utils';
import { log_error } from 'Log';

export const DEFAULT_SETTINGS: Settings = {
	command_timeout: 5,
	templates_folder: "",
	templates_pairs: [["", ""]],
	trigger_on_file_creation: false,
	enable_system_commands: false,
	shell_path: "",
	user_scripts_folder: undefined,
	empty_file_template: undefined,
	syntax_highlighting: true,
    enabled_templates_hotkeys: [""],
    startup_templates: [""],
};

export interface Settings {
	command_timeout: number;
	templates_folder: string;
	templates_pairs: Array<[string, string]>;
	enable_system_commands: boolean;
	shell_path: string,
	user_scripts_folder: string,
	empty_file_template: string,
	trigger_on_file_creation: boolean;
	syntax_highlighting: boolean,
    enabled_templates_hotkeys: Array<string>,
    startup_templates: Array<string>,
};

export class TemplaterSettingTab extends PluginSettingTab {
	constructor(public app: App, private plugin: TemplaterPlugin) {
		super(app, plugin);
	}

	display(): void {
		this.containerEl.empty();

        this.add_template_folder_setting();
        this.add_internal_functions_setting();
        this.add_syntax_highlighting_setting();
        this.add_trigger_on_new_file_creation_setting();
        this.add_templates_hotkeys_setting();
        this.add_startup_templates_setting();
        this.add_user_script_functions_setting();
        this.add_user_system_command_functions_setting();
	}

    add_template_folder_setting() {
		new Setting(this.containerEl)
			.setName("Template folder location")
			.setDesc("Files in this folder will be available as templates.")
			.addSearch(cb => {
                new FolderSuggest(this.app, cb.inputEl);
				cb.setPlaceholder("Example: folder1/folder2")
					.setValue(this.plugin.settings.templates_folder)
					.onChange((new_folder) => {
						this.plugin.settings.templates_folder = new_folder;
						this.plugin.save_settings();
					})
			});
    }

    add_internal_functions_setting() {
		const desc = document.createDocumentFragment();
		desc.append(
			"Templater provides multiples predefined variables / functions that you can use.",
			desc.createEl("br"),
			"Check the ",
			desc.createEl("a", {
				href: "https://silentvoid13.github.io/Templater/",
				text: "documentation"
			}),
			" to get a list of all the available internal variables / functions.",
		);

		new Setting(this.containerEl)
			.setName("Internal Variables and Functions")
			.setDesc(desc);
    }

    add_syntax_highlighting_setting() {
		const desc = document.createDocumentFragment();
		desc.append(
			"Adds syntax highlighting for Templater commands in edit mode.",
		);	

		new Setting(this.containerEl)
			.setName("Syntax Highlighting")
			.setDesc(desc)
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.syntax_highlighting)
					.onChange(syntax_highlighting => {
						this.plugin.settings.syntax_highlighting = syntax_highlighting;
						this.plugin.save_settings();
						this.plugin.event_handler.update_syntax_highlighting();
					})
			});
    }


    add_trigger_on_new_file_creation_setting() {
		let desc = document.createDocumentFragment();
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
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.trigger_on_file_creation)
					.onChange(trigger_on_file_creation => {
						this.plugin.settings.trigger_on_file_creation = trigger_on_file_creation;
						this.plugin.save_settings();
						this.plugin.event_handler.update_trigger_file_on_creation();
						// Force refresh
						this.display();
					});
			});

		if (this.plugin.settings.trigger_on_file_creation) {
			desc = document.createDocumentFragment();
			desc.append(
				"Templater will automatically apply this template to new empty files when they are created.",
				desc.createEl("br"),
				"The .md extension for the file shouldn't be specified."
			);
			
			new Setting(this.containerEl)
				.setName("Empty file template")
				.setDesc(desc)
				.addSearch(cb => {
                    new FileSuggest(this.app, cb.inputEl, this.plugin, FileSuggestMode.TemplateFiles);

					cb.setPlaceholder("folder1/template_file")
						.setValue(this.plugin.settings.empty_file_template)
						.onChange((empty_file_template) => {
							this.plugin.settings.empty_file_template = empty_file_template;
							this.plugin.save_settings();
						});
				});
		}
    }

    add_templates_hotkeys_setting() {
        this.containerEl.createEl("h2", { text: "Templates Hotkeys"});

        this.plugin.settings.enabled_templates_hotkeys.forEach((template, index) => {
            const s = new Setting(this.containerEl)
                .addSearch(cb => {
                    new FileSuggest(this.app, cb.inputEl, this.plugin, FileSuggestMode.TemplateFiles);
                    cb.setPlaceholder("Example: folder1/template_file")
                        .setValue(template)
                        .onChange((new_template) => {
                            if (new_template !== "" && this.plugin.settings.enabled_templates_hotkeys.contains(new_template)) {
                                log_error(new TemplaterError("This template is already bound to a hotkey"));
                                return;
                            }
                            this.plugin.command_handler.add_template_hotkey(this.plugin.settings.enabled_templates_hotkeys[index], new_template);
                            this.plugin.settings.enabled_templates_hotkeys[index] = new_template;
                            this.plugin.save_settings();
                        });
                })
                .addExtraButton(cb => {
                    cb.setIcon("any-key")
                        .setTooltip("Configure Hotkey")
                        .onClick(() => {
                            // TODO: Replace with future "official" way to do this
                            // @ts-ignore
                            this.app.setting.openTabById("hotkeys");
                            // @ts-ignore
                            const tab = this.app.setting.activeTab;
                            tab.searchInputEl.value = "Templater: Insert";
                            tab.updateHotkeyVisibility();
                        });
                })
                .addExtraButton(cb => {
                    cb.setIcon("cross")
                        .setTooltip("Delete")
                        .onClick(() => {
                            this.plugin.command_handler.remove_template_hotkey(this.plugin.settings.enabled_templates_hotkeys[index]);
                            this.plugin.settings.enabled_templates_hotkeys.splice(index, 1);
                            // Force refresh
                            this.display();
                        });
                });
            s.infoEl.remove();
        });

        new Setting(this.containerEl)
            .addButton(cb => {
                cb.setButtonText("Add new hotkey for template")
                    .setCta()
                    .onClick(_ => {
                        this.plugin.settings.enabled_templates_hotkeys.push("");
                        // Force refresh
                        this.display();
                    });
            });
    }

    add_startup_templates_setting() {
        this.containerEl.createEl("h2", { text: "Startup Templates"});

		const desc = document.createDocumentFragment();
		desc.append(
			"Startup Templates are templates that will get executed once when Templater starts.",
			desc.createEl("br"),
			"These templates won't output anything.",
			desc.createEl("br"),
			"This can be useful to set up templates adding hooks to obsidian events for example.",
		);
        
		new Setting(this.containerEl)
			.setDesc(desc);

        this.plugin.settings.startup_templates.forEach((template, index) => {
            const s = new Setting(this.containerEl)
                .addSearch(cb => {
                    new FileSuggest(this.app, cb.inputEl, this.plugin, FileSuggestMode.TemplateFiles);
                    cb.setPlaceholder("Example: folder1/template_file")
                        .setValue(template)
                        .onChange((new_template) => {
                            if (new_template !== "" && this.plugin.settings.startup_templates.contains(new_template)) {
                                log_error(new TemplaterError("This startup template already exist"));
                                return;
                            }
                            this.plugin.settings.startup_templates[index] = new_template;
                            this.plugin.save_settings();
                        });
                })
                .addExtraButton(cb => {
                    cb.setIcon("cross")
                        .setTooltip("Delete")
                        .onClick(() => {
                            this.plugin.settings.startup_templates.splice(index, 1);
                            // Force refresh
                            this.display();
                        });
                });
            s.infoEl.remove();
        });

        new Setting(this.containerEl)
            .addButton(cb => {
                cb.setButtonText("Add new startup template")
                    .setCta()
                    .onClick(_ => {
                        this.plugin.settings.startup_templates.push("");
                        // Force refresh
                        this.display();
                    });
            });
    }

    add_user_script_functions_setting() {
        this.containerEl.createEl("h2", { text: "User Script Functions"});

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
			" for more informations.",
		);

		new Setting(this.containerEl)
			.setName("Script files folder location")
			.setDesc(desc)
			.addSearch(cb => {
                new FolderSuggest(this.app, cb.inputEl);
				cb.setPlaceholder("Example: folder1/folder2")
					.setValue(this.plugin.settings.user_scripts_folder)
					.onChange((new_folder) => {
						this.plugin.settings.user_scripts_folder = new_folder;
						this.plugin.save_settings();
					});
			});

        desc = document.createDocumentFragment();
        let files: TFile[];
        files = errorWrapperSync(() => get_tfiles_from_folder(this.app, this.plugin.settings.user_scripts_folder), `User Scripts folder doesn't exist`);
        if (!files) {
            files = [];
        }

        let name: string;
        let count = 0;
        for (const file of files) {
            if (file.extension === "js") {
                count++;
                desc.append(
                    desc.createEl("li", {
                        text: `tp.user.${file.basename}`
                    })
                );
            }
        }
        if (count === 0) {
            name = "No User Scripts detected";
        } else {
            name = "Detected User Scripts";
        }

        new Setting(this.containerEl)
            .setName(name)
            .setDesc(desc)
            .addExtraButton(extra => {
                extra.setIcon("sync")
                    .setTooltip("Refresh")
                    .onClick(() => {
                        // Force refresh
                        this.display();  
                    });
            });
    }

    add_user_system_command_functions_setting() {
		let desc = document.createDocumentFragment();
		desc.append(
			"Allows you to create user functions linked to system commands.",
			desc.createEl("br"),
			desc.createEl("b", {
				text: "Warning: "
			}),
			"It can be dangerous to execute arbitrary system commands from untrusted sources. Only run system commands that you understand, from trusted sources.",
		);

        this.containerEl.createEl("h2", { text: "User System Command Functions"});

		new Setting(this.containerEl)
			.setName("Enable User System Command Functions")
			.setDesc(desc)
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.enable_system_commands)
					.onChange(enable_system_commands => {
						this.plugin.settings.enable_system_commands = enable_system_commands;
						this.plugin.save_settings();
						// Force refresh
						this.display();
					});
			});

		if (this.plugin.settings.enable_system_commands) {
            new Setting(this.containerEl)
                .setName("Timeout")
                .setDesc("Maximum timeout in seconds for a system command.")
                .addText(text => {
                    text.setPlaceholder("Timeout")
                        .setValue(this.plugin.settings.command_timeout.toString())
                        .onChange((new_value) => {
                            const new_timeout = Number(new_value);
                            if (isNaN(new_timeout)) {
                                log_error(new TemplaterError("Timeout must be a number"));
                                return;
                            }
                            this.plugin.settings.command_timeout = new_timeout;
                            this.plugin.save_settings();
                        })
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
				.addText(text => {
					text.setPlaceholder("Example: /bin/bash, ...")
						.setValue(this.plugin.settings.shell_path)
						.onChange((shell_path) => {
							this.plugin.settings.shell_path = shell_path;
							this.plugin.save_settings();
						})
				});

			let i = 1;
			this.plugin.settings.templates_pairs.forEach((template_pair) => {
				const div = this.containerEl.createEl('div');
				div.addClass("templater_div");

				const title = this.containerEl.createEl('h4', {
					text: 'User Function n°' + i,
				});
				title.addClass("templater_title");

				const setting = new Setting(this.containerEl)
					.addExtraButton(extra => {
						extra.setIcon("cross")
							.setTooltip("Delete")
							.onClick(() => {
								const index = this.plugin.settings.templates_pairs.indexOf(template_pair);
								if (index > -1) {
									this.plugin.settings.templates_pairs.splice(index, 1);
									// Force refresh
									this.plugin.save_settings();
									this.display();
								}
							})
					})
					.addText(text => {
							const t = text.setPlaceholder('Function name')
							.setValue(template_pair[0])
							.onChange((new_value) => {
                                console.log(template_pair);
								const index = this.plugin.settings.templates_pairs.indexOf(template_pair);
								if (index > -1) {
									this.plugin.settings.templates_pairs[index][0] = new_value;
									this.plugin.save_settings();
								}
							});
							t.inputEl.addClass("templater_template");

							return t;
						}
					)
					.addTextArea(text => {
						const t = text.setPlaceholder('System Command')
						.setValue(template_pair[1])
						.onChange((new_cmd) => {
							const index = this.plugin.settings.templates_pairs.indexOf(template_pair);
							if (index > -1) {
								this.plugin.settings.templates_pairs[index][1] = new_cmd;
								this.plugin.save_settings();
							}
						});

						t.inputEl.setAttr("rows", 2);
						t.inputEl.addClass("templater_cmd");

						return t;
					});

				setting.infoEl.remove();

				div.appendChild(title);
				div.appendChild(this.containerEl.lastChild);

				i+=1;
			});

			const div = this.containerEl.createEl('div');
			div.addClass("templater_div2");

			const setting = new Setting(this.containerEl)
				.addButton(button => {
					button.setButtonText("Add New User Function")
                        .setCta()
                        .onClick(() => {
                            this.plugin.settings.templates_pairs.push(["", ""]);
                            // Force refresh
                            this.display();
                        });
				});
			setting.infoEl.remove();

			div.appendChild(this.containerEl.lastChild);
		}	
    }
}
