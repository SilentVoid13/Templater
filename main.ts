import { App, HoverPopover, MarkdownSourceView, MarkdownView, MenuDom, MenuGroupDom, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, WorkspaceLeaf } from 'obsidian';
import { execSync } from 'child_process';
import { setFlagsFromString } from 'v8';

export default class TemplaterPlugin extends Plugin {
	public settings: TemplaterSettings;

	async onload() {
		this.settings = (await this.loadData()) || new TemplaterSettings();

		this.addRibbonIcon('dice', 'Templater', async () => {
			this.replace_templates();

			let leaf = this.app.workspace.activeLeaf;
			console.log(leaf);
			if (leaf instanceof MarkdownView) {
				let m_leaf: MarkdownView = leaf;
				console.log(m_leaf.getMode());
				m_leaf.showSearch();
			}
			else {
				console.log("here");
			}
		});

		this.addStatusBarItem().setText('TEST STATUS BAR TEXT');

		//new SampleModal(this.app).open();

		this.addSettingTab(new TemplaterSettingTab(this.app, this));
	}

	async onunload() {
		await this.saveData(this.settings);
	}

	async replace_templates(): Promise<void> {
		let files = this.app.vault.getFiles();
		let file = files[0];
		let content = await this.app.vault.read(file);

		/*
		let content: string;
		let activeLeaf = this.app.workspace.activeLeaf;
		if (activeLeaf && activeLeaf.view instanceof MarkdownView) {
			content = activeLeaf.view.data;
		}
		*/

		let i = 1;
		
		this.settings.templates_pairs.forEach((template_pair) => {	
			let template = template_pair[0];
			let cmd = template_pair[1];

			if (template === "" || cmd === "") {
				return;
			}

			if (content.contains(template)) {
				try {
					let stdout = execSync(cmd);
					let output = stdout.toString().trim();

					content = content.replace(
						new RegExp(template, "g"), 
						output
					);

					this.app.vault.modify(file, content);
				}
				catch (error) {
					new Notice('ERROR !');
					console.log(`error: ${error.message}`);
				}
			}
		});
	}
}

class TemplaterSettings {
	templates_pairs: Array<[string, string]> = [["", ""]];
}

class AddTemplateModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		let {contentEl} = this;

		new Setting(contentEl)
			.setName('Template ')
			.addText(text => {
					text.setPlaceholder('Template')
					.setValue("test")
					.onChange((value) => {

					})
				}
			)
			.addText(text => text.setPlaceholder('Command')
				.setValue("test2")
				.onChange((value) => {
				})
			);
	}

	onClose() {
		
	}
}

class TemplaterSettingTab extends PluginSettingTab {

	display(): void {
		const plugin: TemplaterPlugin = (this as any).plugin;
		let {containerEl} = this;
		containerEl.empty();

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
						let t = text.setPlaceholder('Template')
						.setValue(template_pair[0])
						.onChange((new_value) => {
							let index = plugin.settings.templates_pairs.indexOf(template_pair);
							if (index > -1) {
								plugin.settings.templates_pairs[index][0] = new_value;
								plugin.saveData(plugin.settings);
								console.log(plugin.settings);
							}
						});
						t.inputEl.addClass("templater_template");

						return t;
					}
				)
				.addTextArea(text => {
					let t = text.setPlaceholder('Command')
					.setValue(template_pair[1])
					.onChange((new_cmd) => {
						let index = plugin.settings.templates_pairs.indexOf(template_pair);
						if (index > -1) {
							plugin.settings.templates_pairs[index][1] = new_cmd;
							plugin.saveData(plugin.settings);
							console.log(plugin.settings);
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
