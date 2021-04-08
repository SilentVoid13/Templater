import { App, PluginSettingTab, Setting } from "obsidian";

import TemplaterPlugin from './main';

export const DEFAULT_SETTINGS: TemplaterSettings = {
	command_timeout: 5,
	template_folder: "",
	templates_pairs: [["", ""]],
	toggle_notice: false,
};

export interface TemplaterSettings {
	command_timeout: number;
	template_folder: string;
	templates_pairs: Array<[string, string]>;
	toggle_notice: boolean;
}

export class TemplaterSettingTab extends PluginSettingTab {
	constructor(public app: App, private plugin: TemplaterPlugin) {
		super(app, plugin);
	}

	display(): void {
		let {containerEl} = this;
		containerEl.empty();

		// TODO: Remove this
		let notice_fragment = document.createDocumentFragment();
		let notice_div = notice_fragment.createEl("div");
		notice_div.innerHTML = `What? Templater is <b>evolving</b>!<br/>
The template syntax changed in this release, check out the new documentation for it on <a href="https://github.com/SilentVoid13/Templater#templater-obsidian-plugin">Templater's Github</a> or in the community plugins page.<br/>
Enjoy new features for Templater: new internal templates, user templates arguments, conditional statements and more.<br/>
Every already existing feature still exists of course, you just need to update the syntax in your templates files.<br/>
Thanks for using Templater! SilentVoid.<br/>
This message will self-destruct in the next update.`;
		new Setting(containerEl)
			.setName("Templater Update")
			.setDesc(notice_fragment);

		let fragment = document.createDocumentFragment();
		let link = document.createElement("a");
		link.href = "https://github.com/SilentVoid13/Templater#internal-commands";
		link.text = "here";
		fragment.append("Click ");
		fragment.append(link);
		fragment.append(" to get a list of all the available internal variables / functions.");

		new Setting(containerEl)
			.setName("Disables update Notice")
			.addToggle(toggle => {
				toggle.setValue(this.plugin.settings.toggle_notice)
					.onChange(toggle_notice => {
						this.plugin.settings.toggle_notice = toggle_notice;
						this.plugin.saveSettings();
					})
			})

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
							this.plugin.log_error("Timeout must be a number");
							return;
						}
						this.plugin.settings.command_timeout = new_timeout;
						this.plugin.saveSettings();
					})
			});

		new Setting(containerEl)
			.setName("Internal Variables and Functions")
			.setDesc(fragment);

		let i = 1;
		this.plugin.settings.templates_pairs.forEach((template_pair) => {
			let div = containerEl.createEl('div');
			div.addClass("templater_div");

			let title = containerEl.createEl('h4', {
				text: 'User Function n°' + i,
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
						let t = text.setPlaceholder('Function name')
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
				let b = button.setButtonText("Add New User Command").onClick(() => {
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