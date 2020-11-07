import { App, MarkdownView, Notice, Plugin, PluginSettingTab, Setting, TAbstractFile, TFile } from 'obsidian';
import { exec } from 'child_process';
import { promisify } from "util";

import { internal_templates_map, replace_internal_templates } from "./internal_templates";

const exec_promise = promisify(exec);

export default class TemplaterPlugin extends Plugin {
	public settings: TemplaterSettings; 

	async onload() {
		let templates = this.app.internalPlugins.getPluginById("templates");
		if (!templates) {
			new Notice("Error: Couldn't find the internal Templates plugin, aborting.");
			return;
		}
		if (templates.instance.modal === null) {
			new Notice("This plugin relies on the internal Templates plugin, enabling Templates ...");
			templates.enable();
		}

		// loadData() refresh the modal value
		this.settings = (await this.loadData()) || new TemplaterSettings();

		// If it's still null after enabling it
		if (templates.instance.modal === null) {
			new Notice("Error: Couldn't find the modal from the internal Templates plugin, aborting.");
			return;
		}
		const pluginTemplate = templates.instance.constructor;
		const modalTemplates = templates.instance.modal.constructor;

		class CustomPluginTemplates extends pluginTemplate {
			constructor(app: App) {
				super(app);
			}
		}

		class CustomModalTemplates extends modalTemplates {
			app: App;
			settings: TemplaterSettings;

			constructor(app: App, template_plugin: CustomPluginTemplates, settings: TemplaterSettings) {
				super(app);
				this.app = app;
				this.templatePlugin = template_plugin;
				this.settings = settings;
				this.update_template_files();
			}

			onChooseOption(suggestionItem: TFile, evt: Event) {
				this.replace_templates(suggestionItem);
			}

			async replace_templates(file: TFile) {
				let content = await this.app.vault.read(file);

				let activeLeaf = this.app.workspace.activeLeaf;
				if (! activeLeaf && activeLeaf instanceof MarkdownView) {
					return;
				}

				let editor = activeLeaf.view.sourceMode.cmEditor;
				let doc = editor.getDoc();

				// User defined templates
				for (let i = 0; i < this.settings.templates_pairs.length; i++) {
					let template_pair = this.settings.templates_pairs[i];
					let template = template_pair[0];
					let cmd = template_pair[1];

					if (template === "" || cmd === "") {
						continue;
					}

					if (content.contains(template)) {
						try {
							let {stdout, stderr} = await exec_promise(cmd, {timeout: this.settings.command_timeout*1000});

							content = content.replace(
								new RegExp(template, "g"), 
								stdout.trim()
							);
						}
						catch(error) {
							new Notice("Error with the template n°" + (i+1));
						}
					}
				}

				// Internal templates
				content = await replace_internal_templates(content);
				
				doc.replaceSelection(content);
			}

			update_template_files() {
				if (this.settings.template_folder === "") {
					let files = this.app.vault.getFiles();
					this.templatePlugin.templateFiles = this.templatePlugin.templateFiles.concat(files);
				}
				else {
					let abstract_files = this.app.vault.getAbstractFileByPath(this.settings.template_folder);
					if (!abstract_files) {
						throw new Error("Template folder doesn't exist");
					}
					let files = this.getAllFilesFrom(abstract_files);

					this.templatePlugin.templateFiles = this.templatePlugin.templateFiles.concat(files);
				}
			}

			getAllFilesFrom(file: TAbstractFile) {
				let files: Array<TFile> = [];
				for (let f of file.children) {
					if (f instanceof TFile) {
						files.push(f);
					}
					else {
						files = files.concat(this.getAllFilesFrom(f));
					}
				}
				return files;
			}
		}

		// TODO: find a good icon
		this.addRibbonIcon('three-horizontal-bars', 'Templater', async () => {
			let plugin_template = new CustomPluginTemplates(this.app);

			try {
				let m = new CustomModalTemplates(this.app, plugin_template, this.settings);
				m.open();
			}
			catch(error) {
				new Notice(error);
			}
		});

		this.addSettingTab(new TemplaterSettingTab(this.app, this));
	}

	async onunload() {
		await this.saveData(this.settings);
	}
}

class TemplaterSettings {
	command_timeout = 5;
	template_folder = "";
	templates_pairs: Array<[string, string]> = [["", ""]];
}

class TemplaterSettingTab extends PluginSettingTab {

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
								if (new_value in internal_templates_map) {
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
