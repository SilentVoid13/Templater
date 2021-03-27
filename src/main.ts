import { MarkdownView, Notice, Plugin, TAbstractFile, TFile } from 'obsidian';

import { DEFAULT_SETTINGS, TemplaterSettings, TemplaterSettingTab } from 'Settings';
import { TemplaterFuzzySuggestModal } from 'TemplaterFuzzySuggest';
import { ContextMode, TemplateParser } from 'TemplateParser';

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

export default class TemplaterPlugin extends Plugin {
	public fuzzySuggest: TemplaterFuzzySuggestModal;
	public settings: TemplaterSettings; 
	public parser: TemplateParser

	async onload() {
		await this.loadSettings();

		this.fuzzySuggest = new TemplaterFuzzySuggestModal(this.app, this);
		this.parser = new TemplateParser(this.app, this);

		this.registerMarkdownPostProcessor((el, ctx) => this.dynamic_templates_processor(el, ctx));

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
				this.replace_in_active_file();
            },
        });

		this.addCommand({
			id: "jump-to-next-cursor-location",
			name: "Jump to next cursor location",
			hotkeys: [
				{
					modifiers: ["Alt"],
					key: "Tab",
				},
			],
			callback: () => {
				this.parser.jump_to_next_cursor_location();
			}
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

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	replace_in_active_file(): void {
		try {
			let active_view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (active_view === null) {
				throw new Error("Active view is null");
			}
			this.parser.replace_templates_and_overwrite_in_file(active_view.file);
		}
		catch(error) {
			this.log_error(error);
		}
	}

	log_error(msg: string, error?: string) {
		if (error) {
			console.log(msg, error);
			new Notice(`Templater Error: ${msg}\nCheck console for more informations`);
		}
		else {
			new Notice(`Templater Error: ${msg}`);
		}
	}

	async dynamic_templates_processor(el: HTMLElement, ctx: any) {
		if (el.textContent.contains("tp.dynamic")) {
			let new_html = await this.parser.parseTemplates(
				el.innerHTML, 
				this.app.workspace.getActiveFile(), 
				ContextMode.DYNAMIC
			);

			el.innerHTML = new_html;
		}
	}
}