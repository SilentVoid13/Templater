import { App, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';
import { execSync } from 'child_process';

export default class MyPlugin extends Plugin {
	public settings: TemplaterSettings;

	async onload() {
		this.settings = (await this.loadData()) || new TemplaterSettings();

		console.log('loading plugin');
		
		/*
		exec("ls -la", (error, stdout, stderr) => {
		    if (error) {
			console.log(`error: ${error.message}`);
			return;
		    }
		    if (stderr) {
			console.log(`stderr: ${stderr}`);
			return;
		    }
		    console.log(`stdout: ${stdout}`);
		});
		*/
		
		this.addRibbonIcon('dice', 'Templater', async () => {
			console.log(this.settings);

			let files = this.app.vault.getFiles();

			let file = files[0];

			let i = 1;

			let content = await this.app.vault.read(file);

			for (let template in this.settings.templates) {	
				let cmd = this.settings.templates[template];

				if (template === "" || cmd === "") {
					continue;
				}

				console.log("i:",i);
				if (content.contains(template)) {
					try {
						let stdout = execSync(cmd);
						console.log(stdout);
						console.log(stdout.toString());

						content = content.replace(
							template, 
							stdout.toString()
						);
						console.log("ii:",i);
						this.app.vault.modify(file, content);
					}
					catch (error) {
						new Notice('ERROR !');
						console.log(`error: ${error.message}`);
					}
				
					i += 1;
				}
			}

		});

		this.addStatusBarItem().setText('TEST STATUS BAR TEXT');

		//new SampleModal(this.app).open();

		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.registerEvent(this.app.on('codemirror', (cm: CodeMirror.Editor) => {
			console.log('codemirror', cm);
		}));

		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	async onunload() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		let {contentEl} = this;
		contentEl.setText('TEST WHOAH!');
	}

	onClose() {
		
	}
}

class TemplaterSettings {
	templates: {[template: string]: string} = {"": ""};
}

class SampleSettingTab extends PluginSettingTab {
	display(): void {
		const plugin: MyPlugin = (this as any).plugin;
		let {containerEl} = this;

		containerEl.empty();

		let i = 1;

		for (let template in plugin.settings.templates) {
			let old_value = template;
			let cmd = plugin.settings.templates[template];

			new Setting(containerEl)
				.setName('Template ' + i)
				.addText(text => {
						text.setPlaceholder('Template')
						.setValue(template)
						.onChange((value) => {
							cmd = plugin.settings.templates[old_value];
							console.log("cmd", cmd);
							delete plugin.settings.templates[old_value];
							console.log("old_value:",old_value);

							if (value !== "") {
								console.log("new_value:",value);
								plugin.settings.templates[value] = cmd;
								old_value = value;
							}
							else {
								// Force refresh
								this.display();
							}
							
							plugin.saveData(plugin.settings);
							console.log(plugin.settings);
						})
					}
				)
				.addText(text => text.setPlaceholder('Command')
					.setValue(cmd)
					.onChange((value) => {
						plugin.settings.templates[old_value] = value;
						plugin.saveData(plugin.settings);
						console.log(plugin.settings);
					})
				);

				i+=1;
		}

		new Setting(containerEl)
			.addButton(button => {
				button.setButtonText("Add Template").onClick(() => {
					plugin.settings.templates[""] = "";
					// Force refresh
					this.display();
				})
			});
	}
}
