import { MarkdownView, Notice, Plugin, TAbstractFile, TFile } from 'obsidian';
import moment from 'moment';

import { default_settings, TemplaterSettings, TemplaterSettingTab } from './Settings';
import { TemplaterFuzzySuggestModal } from './TemplaterFuzzySuggest';
import { TemplateParser } from './TemplateParser';

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

export default class TemplaterPlugin extends Plugin {
	public fuzzySuggest: TemplaterFuzzySuggestModal;
	public settings: TemplaterSettings; 
	public parser: TemplateParser

	async onload() {		
		this.settings = Object.assign(default_settings, await this.loadData());

		this.fuzzySuggest = new TemplaterFuzzySuggestModal(this.app, this);

		this.change_locale(this.settings.locale);

		this.parser = new TemplateParser(this.app, this);

		this.addRibbonIcon('three-horizontal-bars', 'Templater', async () => {
			this.fuzzySuggest.start();
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
				this.fuzzySuggest.start();
			},
		});

		this.addCommand({
            id: "replace-in-file-templater",
            name: "Replace templates in the active file",
            hotkeys: [
                {
                    modifiers: ["Alt"],
                    key: 'r',
                },
            ],
            callback: () => {
                try {
					let active_view = this.app.workspace.getActiveViewOfType(MarkdownView);
					if (active_view == null) {
						throw new Error("Active view is null");
					}
					this.parser.replace_templates_and_overwrite_in_file(active_view.file);
				}
				catch(error) {
					new Notice(error);
				}
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
				this.parser.replace_templates_and_overwrite_in_file(file);
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