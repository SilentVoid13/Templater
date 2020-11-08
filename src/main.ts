import { App, MarkdownView, Notice, Plugin, TAbstractFile, TFile } from 'obsidian';
import { exec } from 'child_process';
import { promisify } from "util";

import { replace_internal_templates } from "./internal_templates";
import { TemplaterSettings, TemplaterSettingTab } from './settings';
import { replace_internal_command_templates } from './internal_command_templates';

const exec_promise = promisify(exec);

export default class TemplaterPlugin extends Plugin {
	public settings: TemplaterSettings; 
	public modal: any;

	async onload() {
		let templates = this.app.internalPlugins.getPluginById("templates");
		if (!templates) {
			new Notice("Error: Couldn't find the internal Templates plugin, aborting.");
			return;
		}
		if (templates.instance.modal === null) {
			console.log("Templater relies on the internal Templates plugin, enabling Templates ...");
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
			}

			onChooseOption(suggestionItem: TFile, evt: Event) {
				this.replace_templates(suggestionItem);
			}

			async replace_templates(file: TFile) {
				let content = await this.app.vault.read(file);

				let activeLeaf = this.app.workspace.activeLeaf;
				if (!(activeLeaf && activeLeaf.view instanceof MarkdownView)) {
					return;
				}

				let editor = activeLeaf.view.sourceMode.cmEditor;
				let doc = editor.getDoc();

				// User defined templates
				for (let i = 0; i < this.settings.templates_pairs.length; i++) {
					let template_pair = this.settings.templates_pairs[i];
					let template = template_pair[0];
					let cmd = template_pair[1];
					cmd = await replace_internal_command_templates(this.app, cmd);

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
							console.log(`Error with the template n° ${(i+1)}:\n`, error);
							new Notice("Error with the template n°" + (i+1) + " (check console for more informations)");
						}
					}
				}

				// Internal templates
				content = await replace_internal_templates(this.app, content);
				
				doc.replaceSelection(content);
			}

			update_template_files() {
				if (this.settings.template_folder === "") {
					let files = this.app.vault.getFiles();
					this.templatePlugin.templateFiles = this.templatePlugin.templateFiles.concat(files);
				}
				else {
					let settings_folder = this.settings.template_folder;

					if (this.settings.template_folder.endsWith("/")) {
						settings_folder = this.settings.template_folder.slice(0, -1);
					}

					let abstract_files = this.app.vault.getAbstractFileByPath(settings_folder);
					if (!abstract_files) {
						throw new Error(settings_folder + " folder doesn't exist");
					}
					this.templatePlugin.templateFiles = this.getAllFilesFrom(abstract_files);
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

		let plugin_template = new CustomPluginTemplates(this.app);
		this.modal = new CustomModalTemplates(this.app, plugin_template, this.settings);
		
		// TODO: find a good icon
		this.addRibbonIcon('three-horizontal-bars', 'Templater', async () => {
			try {
				this.modal.update_template_files();
				this.modal.open();
			}
			catch(error) {
				new Notice(error);
			}
		});

		this.addCommand({
			id: "insert-templater",
			name: "Insert Template",
			hotkeys: [
				{
					modifiers: ["Alt"],
					key: 'e',
				},
			],
			callback: () => {
				try {
					this.modal.update_template_files();
					this.modal.open();
				}
				catch(error) {
					new Notice(error);
				}
			},
		});

		this.addSettingTab(new TemplaterSettingTab(this.app, this));
	}

	async onunload() {
		await this.saveData(this.settings);
	}
}