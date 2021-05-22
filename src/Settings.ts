import { TemplaterError } from "Error";
import { App, PluginSettingTab, Setting } from "obsidian";

import TemplaterPlugin from './main';

export const DEFAULT_SETTINGS: TemplaterSettings = {
	command_timeout: 5,
	template_folder: "",
	templates_pairs: [["", ""]],
	trigger_on_file_creation: false,
	enable_system_commands: false,
	shell_path: "",
	script_folder: undefined,
	empty_file_template: undefined,
};

export interface TemplaterSettings {
	command_timeout: number;
	template_folder: string;
	templates_pairs: Array<[string, string]>;
	trigger_on_file_creation: boolean;
	enable_system_commands: boolean;
	shell_path: string,
	script_folder: string,
	empty_file_template: string,
};

export class TemplaterSettingTab extends PluginSettingTab {
	constructor(public app: App, private plugin: TemplaterPlugin) {
		super(app, plugin);
	}

	display(): void {
		const {containerEl} = this;
		let desc: DocumentFragment;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Template folder location")
			.setDesc("Files in this folder will be available as templates.")
			.addText(text => {
				text.setPlaceholder("Example: folder 1/folder 2")
					.setValue(this.plugin.settings.template_folder)
					.onChange((new_folder) => {
						this.plugin.settings.template_folder = new_folder;
						this.plugin.saveSettings();
					})
			});

		new Setting(containerEl)
			.setName("Timeout")
			.setDesc("Maximum timeout in seconds for a system command.")
			.addText(text => {
				text.setPlaceholder("Timeout")
					.setValue(this.plugin.settings.command_timeout.toString())
					.onChange((new_value) => {
						const new_timeout = Number(new_value);
						if (isNaN(new_timeout)) {
							this.plugin.log_error(new TemplaterError("Timeout must be a number"));
							return;
						}
						this.plugin.settings.command_timeout = new_timeout;
						this.plugin.saveSettings();
					})
			});

		desc = document.createDocumentFragment();
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

		new Setting(containerEl)
			.setName("Internal Variables and Functions")
			.setDesc(desc);

		desc = document.createDocumentFragment();
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

		new Setting(containerEl)
			.setName("Trigger Templater on new file creation")
			.setDesc(desc)
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.trigger_on_file_creation)
					.onChange(trigger_on_file_creation => {
						this.plugin.settings.trigger_on_file_creation = trigger_on_file_creation;
						this.plugin.saveSettings();
						this.plugin.update_trigger_file_on_creation();
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
			
			new Setting(containerEl)
				.setName("Empty file template")
				.setDesc(desc)
				.addText(text => {
					text.setPlaceholder("folder 1/template_file")
						.setValue(this.plugin.settings.empty_file_template)
						.onChange((empty_file_template) => {
							this.plugin.settings.empty_file_template = empty_file_template;
							this.plugin.saveSettings();
						});
				});
		}

		desc = document.createDocumentFragment();
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

		new Setting(containerEl)
			.setName("Script files folder location")
			.setDesc(desc)
			.addText(text => {
				text.setPlaceholder("Example: folder 1/folder 2")
					.setValue(this.plugin.settings.script_folder)
					.onChange((new_folder) => {
						this.plugin.settings.script_folder = new_folder;
						this.plugin.saveSettings();
					})
			});

		desc = document.createDocumentFragment();
		desc.append(
			"Allows you to create user functions linked to system commands.",
			desc.createEl("br"),
			desc.createEl("b", {
				text: "Warning: "
			}),
			"It can be dangerous to execute arbitrary system commands from untrusted sources. Only run system commands that you understand, from trusted sources.",
		);

		new Setting(containerEl)
			.setName("Enable System Commands")
			.setDesc(desc)
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.enable_system_commands)
					.onChange(enable_system_commands => {
						this.plugin.settings.enable_system_commands = enable_system_commands;
						this.plugin.saveSettings();
						// Force refresh
						this.display();
					});
			});

		if (this.plugin.settings.enable_system_commands) {
			desc = document.createDocumentFragment();
			desc.append(
				"Full path to the shell binary to execute the command with.",
				desc.createEl("br"),
				"This setting is optional and will default to the system's default shell if not specified.",
				desc.createEl("br"),
				"You can use forward slashes ('/') as path separators on all platforms if in doubt."
			);
			new Setting(containerEl)
				.setName("Shell binary location")
				.setDesc(desc)
				.addText(text => {
					text.setPlaceholder("Example: /bin/bash, ...")
						.setValue(this.plugin.settings.shell_path)
						.onChange((shell_path) => {
							this.plugin.settings.shell_path = shell_path;
							this.plugin.saveSettings();
						})
				});

			let i = 1;
			this.plugin.settings.templates_pairs.forEach((template_pair) => {
				const div = containerEl.createEl('div');
				div.addClass("templater_div");

				const title = containerEl.createEl('h4', {
					text: 'User Function n°' + i,
				});
				title.addClass("templater_title");

				const setting = new Setting(containerEl)
					.addExtraButton(extra => {
						extra.setIcon("cross")
							.setTooltip("Delete")
							.onClick(() => {
								const index = this.plugin.settings.templates_pairs.indexOf(template_pair);
								if (index > -1) {
									this.plugin.settings.templates_pairs.splice(index, 1);
									// Force refresh
									this.plugin.saveSettings();
									this.display();
								}
							})
					})
					.addText(text => {
							const t = text.setPlaceholder('Function name')
							.setValue(template_pair[0])
							.onChange((new_value) => {
								const index = this.plugin.settings.templates_pairs.indexOf(template_pair);
								if (index > -1) {
									this.plugin.settings.templates_pairs[index][0] = new_value;
									this.plugin.saveSettings();
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
								this.plugin.saveSettings();
							}
						});

						t.inputEl.setAttr("rows", 4);
						t.inputEl.addClass("templater_cmd");

						return t;
					});

				setting.infoEl.remove();

				div.appendChild(title);
				div.appendChild(containerEl.lastChild);

				i+=1;
			});

			const div = containerEl.createEl('div');
			div.addClass("templater_div2");

			const setting = new Setting(containerEl)
				.addButton(button => {
					const b = button.setButtonText("Add New User Function").onClick(() => {
						this.plugin.settings.templates_pairs.push(["", ""]);
						// Force refresh
						this.display();
					});
					b.buttonEl.addClass("templater_button");

					return b;
				});
			setting.infoEl.remove();

			div.appendChild(containerEl.lastChild);
		}	
	}
}