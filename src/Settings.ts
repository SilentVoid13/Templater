import { App, Notice, PluginSettingTab, Setting } from "obsidian";

import TemplaterPlugin from './main';

export const DEFAULT_SETTINGS: TemplaterSettings = {
	command_timeout: 5,
	template_folder: "",
	templates_pairs: [["", ""]],
};

export interface TemplaterSettings {
	command_timeout: number;
	template_folder: string;
	templates_pairs: Array<[string, string]>;
}

export class TemplaterSettingTab extends PluginSettingTab {
	constructor(public app: App, private plugin: TemplaterPlugin) {
		super(app, plugin);
	}

	display(): void {
		let {containerEl} = this;
		containerEl.empty();

		let fragment = document.createDocumentFragment();
		let link = document.createElement("a");
		link.href = "https://github.com/SilentVoid13/Templater#internal-templates";
		link.text = "here";
		fragment.textContent = `Click ${link} to get a list of all the available internal templates`;

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
			.setDesc("Maximum timeout in seconds for a command.")
			.addText(text => {
				text.setPlaceholder("Timeout")
					.setValue(this.plugin.settings.command_timeout.toString())
					.onChange((new_value) => {
						let new_timeout = Number(new_value);
						if (isNaN(new_timeout)) {
							new Notice("Timeout must be a number");
							return;
						}
						this.plugin.settings.command_timeout = new_timeout;
						this.plugin.saveSettings();
					})
			});

		new Setting(containerEl)
			.setName("Internal templates")
			.setDesc(fragment);

		let i = 1;
		this.plugin.settings.templates_pairs.forEach((template_pair) => {
			let div = containerEl.createEl('div');
			div.addClass("templater_div");

			let title = containerEl.createEl('h4', {
				text: 'Template n°' + i,
			});
			title.addClass("templater_title");

			let setting = new Setting(containerEl)
				.addExtraButton(extra => {
					extra.setIcon("cross")
						.setTooltip("Delete")
						.onClick(() => {
							let index = this.plugin.settings.templates_pairs.indexOf(template_pair);
							if (index > -1) {
								this.plugin.settings.templates_pairs.splice(index, 1);
								// Force refresh
								this.display();
							}
						})
				})
				.addText(text => {
						let t = text.setPlaceholder('Template Pattern')
						.setValue(template_pair[0])
						.onChange((new_value) => {
							let index = this.plugin.settings.templates_pairs.indexOf(template_pair);
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
					let t = text.setPlaceholder('System Command')
					.setValue(template_pair[1])
					.onChange((new_cmd) => {
						let index = this.plugin.settings.templates_pairs.indexOf(template_pair);
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

		let div = containerEl.createEl('div');
		div.addClass("templater_div2");

		let setting = new Setting(containerEl)
			.addButton(button => {
				let b = button.setButtonText("Add Template").onClick(() => {
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