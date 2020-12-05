import { Notice, Plugin } from 'obsidian';
import moment from 'moment';

import { TemplaterSettings, TemplaterSettingTab } from './settings';
import { TemplaterFuzzySuggestModal } from './fuzzy_suggester';

let daily_note_callback: any;
let templater: TemplaterPlugin;

export default class TemplaterPlugin extends Plugin {
	public fuzzy_suggester: TemplaterFuzzySuggestModal;
	public settings: TemplaterSettings; 

	async onload() {
		// loadData() refresh the modal value
		this.settings = (await this.loadData()) || new TemplaterSettings();

		this.fuzzy_suggester = new TemplaterFuzzySuggestModal(this.app, this);

		daily_note_callback = this.app.internalPlugins.getPluginById("daily-notes").ribbonActions[0].callback;
		templater = this;

		if (this.settings.overload_daily_notes) {
			this.overload_daily_notes();
		}

		this.change_locale(this.settings.locale);

		// TODO: find a good icon
		this.addRibbonIcon('three-horizontal-bars', 'Templater', async () => {
			try {
				this.fuzzy_suggester.open();
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
					this.fuzzy_suggester.open();
				}
				catch(error) {
					new Notice(error);
				}
			},
		});

		this.addSettingTab(new TemplaterSettingTab(this.app, this));
	}

	async overload_daily_notes() {
		this.app.internalPlugins.getPluginById("daily-notes").ribbonActions[0].callback = new_daily_note_callback;
		this.app.internalPlugins.getPluginById("daily-notes").commands[0].callback = new_daily_note_callback;

		// We have to reload the plugin to get the callback working (it will use the old one otherwise idk why)
		await this.app.internalPlugins.getPluginById("daily-notes").disable();
		await this.app.internalPlugins.getPluginById("daily-notes").enable();
	}

	async unload_daily_notes() {
		this.app.internalPlugins.getPluginById("daily-notes").ribbonActions[0].callback = daily_note_callback;
		this.app.internalPlugins.getPluginById("daily-notes").commands[0].callback = daily_note_callback;

		// We have to reload the plugin to get the callback working (it will use the old one otherwise idk why)
		await this.app.internalPlugins.getPluginById("daily-notes").disable();
		await this.app.internalPlugins.getPluginById("daily-notes").enable();
	}

	async onunload() {
		await this.saveData(this.settings);
	}

	change_locale(locale: string) {
		moment.locale(locale);
	}
}

async function new_daily_note_callback() {
	await daily_note_callback();
	templater.fuzzy_suggester.replace_templates_and_overwrite_in_current_file();
}