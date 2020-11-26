import { Notice, PluginSettingTab, Setting } from "obsidian";
import { internal_templates_map } from './internal_templates';
import TemplaterPlugin from './main';
import moment from 'moment';
import 'moment/min/locales';
import { languageName } from './i18n'

export class TemplaterSettings {
	command_timeout = 5;
	template_folder = "";
	overload_daily_notes = false;
	templates_pairs: Array<[string, string]> = [["", ""]];
	locale: string = 'en';
}

export class TemplaterSettingTab extends PluginSettingTab {
	display(): void {
		const plugin: TemplaterPlugin = (this as any).plugin;
		let {containerEl} = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Template folder location")
			.setDesc("Files in this folder will be available as templates.")
			.addText(text => {
				text.setPlaceholder("Example: folder 1/folder 2")
					.setValue(plugin.settings.template_folder)
					.onChange((new_folder) => {
						plugin.settings.template_folder = new_folder;
					})
			});

		new Setting(containerEl)
			.setName("Timeout")
			.setDesc("Maximum timeout in seconds for a command.")
			.addText(text => {
				text.setPlaceholder("Timeout")
					.setValue(plugin.settings.command_timeout.toString())
					.onChange((new_value) => {
						let new_timeout = Number(new_value);
						if (isNaN(new_timeout)) {
							new Notice("Timeout must be a number");
							return;
						}
						plugin.settings.command_timeout = new_timeout;
					})
			});

		new Setting(containerEl)
			.setName("Overload Daily Notes")
			.setDesc("This will trigger Templater when using the Daily Notes core plugin.")
			.addToggle(toggle => {
				toggle.setValue(plugin.settings.overload_daily_notes)
					.onChange((new_value) => {
						plugin.settings.overload_daily_notes = new_value;

						if (new_value) {
							plugin.overload_daily_notes();
						}
						else {
							plugin.unload_daily_notes();
						}
					})
			});

		new Setting(containerEl)
			.setName("Locale")
			.setDesc("The language and country used to format dates in internal templates.")
			.addDropdown(dropdown => {
				moment.locales()
					.map(locale => [locale, languageName(locale)])
					.sort((a,b) => a[1] > b[1] ? 1: -1)
					.forEach(item => dropdown.addOption(item[0], item[1]));

				dropdown
					.setValue(plugin.settings.locale)
					.onChange(locale => {
						plugin.settings.locale = locale;
						plugin.saveData(plugin.settings);

						plugin.change_locale(locale);
					})
			});

		let i = 1;
		plugin.settings.templates_pairs.forEach((template_pair) => {
			let div = containerEl.createEl('div');
			div.addClass("templater_div");

			let title = containerEl.createEl('h4', {
				text: 'Template n°' + i,
			});
			title.addClass("templater_title");

			let setting = new Setting(containerEl)
				.addExtraSetting(extra => {
					extra.setIcon("cross")
						.setTooltip("Delete")
						.onClick(() => {
							let index = plugin.settings.templates_pairs.indexOf(template_pair);

							if (index > -1) {
								plugin.settings.templates_pairs.splice(index, 1);
								// Force refresh
								this.display();
							}
						})
				})
				.addText(text => {
						let t = text.setPlaceholder('Template Pattern')
						.setValue(template_pair[0])
						.onChange((new_value) => {
							let index = plugin.settings.templates_pairs.indexOf(template_pair);
							if (index > -1) {
								let internal_templates = Object.keys(internal_templates_map).map((el: string) => `{{tp_${el}}}`);
								if (internal_templates.contains(new_value)) {
									new Notice("This template pattern is used as an internal template.");
									return;
								}
								plugin.settings.templates_pairs[index][0] = new_value;
								plugin.saveData(plugin.settings);
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
						let index = plugin.settings.templates_pairs.indexOf(template_pair);
						if (index > -1) {
							plugin.settings.templates_pairs[index][1] = new_cmd;
							plugin.saveData(plugin.settings);
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
					plugin.settings.templates_pairs.push(["", ""]);
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
