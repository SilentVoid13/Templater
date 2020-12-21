import { Notice, Plugin, TAbstractFile, TFile } from 'obsidian';
import moment from 'moment';

import { TemplaterSettings, TemplaterSettingTab } from './settings';
import { TemplaterFuzzySuggestModal } from './fuzzy_suggester';

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

export default class TemplaterPlugin extends Plugin {
	public fuzzy_suggester: TemplaterFuzzySuggestModal;
	public settings: TemplaterSettings; 

	async onload() {		
		this.settings = (await this.loadData()) || new TemplaterSettings();
		this.fuzzy_suggester = new TemplaterFuzzySuggestModal(this.app, this);

		this.change_locale(this.settings.locale);

		// TODO: find a good icon
		this.addRibbonIcon('three-horizontal-bars', 'Templater', async () => {
			this.fuzzy_suggester.start();
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
				this.fuzzy_suggester.start();
			},
		});

		this.app.workspace.on("layout-ready", () => {
			// TODO: Find a way to not trigger this on files copy
			this.app.vault.on("create", async (file: TAbstractFile) => {
				// TODO: find a better way to do this
				// Currently, I have to wait for the daily note plugin to add the file content before replacing
				// Not a problem with Calendar however since it creates the file with the existing content
				await delay(300);
				// ! This could corrupt binary files
				if (!(file instanceof TFile) || file.extension !== "md") {
					return;
				}
				this.fuzzy_suggester.replace_templates_and_overwrite_in_file(file);
			});
		});

		this.addSettingTab(new TemplaterSettingTab(this.app, this));
	}

	async onunload() {
		await this.saveData(this.settings);
	}

	change_locale(locale: string) {
		moment.locale(locale);
	}
}