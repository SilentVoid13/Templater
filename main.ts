import { App, HoverPopover, MarkdownSourceView, MarkdownView, MenuDom, MenuGroupDom, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, WorkspaceLeaf } from 'obsidian';
import { exec, execSync } from 'child_process';
import { setFlagsFromString } from 'v8';
import { textSpanContainsPosition } from 'typescript';
import {promisify} from "util";

const exec_promise = promisify(exec);

function getQuickSwitcher(app: App) {
	const switcher = app.internalPlugins.getPluginById("switcher");
	if (!switcher) { return null; }
  
	return switcher.instance.modal.constructor;
}

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

export default class TemplaterPlugin extends Plugin {
	public settings: TemplaterSettings; 

	async onload() {
		const quickSwitcher = getQuickSwitcher(this.app);
		class testSwitcher extends quickSwitcher {
			constructor(appObj) {
				super(appObj);

				//console.log(this);
				//console.log(this.chooser);
			}

			onOpen() {
				this.isOpen = true;
				
			}
		}

		this.settings = (await this.loadData()) || new TemplaterSettings();

		// star
		this.addRibbonIcon('three-horizontal-bars', 'Templater', async () => {
			//let test_switch = new testSwitcher(this.app);
			//test_switch.open();
			//console.log(this.app.internalPlugins);
			//console.log(this.app.internalPlugins.getPluginById("templates"));
			//console.log(this.app.plugins.plugins);

			//new TemplaterFileList(this.app).open();

			console.log("launching_function");
			this.test_async();
			this.replace_templates();
			console.log("exiting_function");
		});

		this.addSettingTab(new TemplaterSettingTab(this.app, this));
	}

	async onunload() {
		await this.saveData(this.settings);
	}

	async test_async() {
		await delay(4000);
		console.log("test_async finished");
	}

	async replace_templates() {
		let activeLeaf = this.app.workspace.activeLeaf;
		if (!activeLeaf || !(activeLeaf.view instanceof MarkdownView)) {
			return;	
		}

		let content = activeLeaf.view.data;
		let file = activeLeaf.view.file;

		console.log("starting_replace_templates");

		for (let i = 0; i < this.settings.templates_pairs.length; i++) {
			let template_pair = this.settings.templates_pairs[i];
			let template = template_pair[0];
			let cmd = template_pair[1];

			if (template === "" || cmd === "") {
				return;
			}

			if (content.contains(template)) {
				try {
					let n = Number(this.settings.command_timeout);
					if (isNaN(n)) {
						continue;
					}
					n *= 1000;

					let {stdout, stderr} = await exec_promise(cmd, {timeout: n});

					content = content.replace(
						new RegExp(template, "g"), 
						stdout.trim()
					);
				}
				catch(error) {
					new Notice("Error with the template n°" + (i+1));
					console.log(error);
				}
			}
		}
		// Maybe add this at each loop with an await (adds some overhead)
		this.app.vault.modify(file, content);
	}
}

class TemplaterSettings {
	templates_pairs: Array<[string, string]> = [["", ""]];
	command_timeout = "5";
}

class TemplaterFileList extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		let {contentEl} = this;
	}

	onClose() {
		
	}
}

class TemplaterSettingTab extends PluginSettingTab {

	display(): void {
		const plugin: TemplaterPlugin = (this as any).plugin;
		let {containerEl} = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Timeout")
			.setDesc("Maximum timeout in seconds for a command")
			.addText(text => {
				text.setPlaceholder("Timeout")
					.setValue(plugin.settings.command_timeout.toString())
					.onChange((new_value) => {
						if (isNaN(+new_value)) {
							new Notice("Timeout must be a number");
							return;
						} 

						plugin.settings.command_timeout = new_value;
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
