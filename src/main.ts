import { addIcon, MarkdownView, Menu, MenuItem, Notice, Plugin, TAbstractFile, TFile, TFolder } from 'obsidian';

import { DEFAULT_SETTINGS, TemplaterSettings, TemplaterSettingTab } from 'Settings';
import { TemplaterFuzzySuggestModal } from 'TemplaterFuzzySuggest';
import { ContextMode, TemplateParser } from 'TemplateParser';
import { delay } from 'TParser';

const ICON_DATA = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 51.1328 28.7"><path d="M0 15.14 0 10.15 18.67 1.51 18.67 6.03 4.72 12.33 4.72 12.76 18.67 19.22 18.67 23.74 0 15.14ZM33.6928 1.84C33.6928 1.84 33.9761 2.1467 34.5428 2.76C35.1094 3.38 35.3928 4.56 35.3928 6.3C35.3928 8.0466 34.8195 9.54 33.6728 10.78C32.5261 12.02 31.0995 12.64 29.3928 12.64C27.6862 12.64 26.2661 12.0267 25.1328 10.8C23.9928 9.5733 23.4228 8.0867 23.4228 6.34C23.4228 4.6 23.9995 3.1066 25.1528 1.86C26.2994.62 27.7261 0 29.4328 0C31.1395 0 32.5594.6133 33.6928 1.84M49.8228.67 29.5328 28.38 24.4128 28.38 44.7128.67 49.8228.67M31.0328 8.38C31.0328 8.38 31.1395 8.2467 31.3528 7.98C31.5662 7.7067 31.6728 7.1733 31.6728 6.38C31.6728 5.5867 31.4461 4.92 30.9928 4.38C30.5461 3.84 29.9995 3.57 29.3528 3.57C28.7061 3.57 28.1695 3.84 27.7428 4.38C27.3228 4.92 27.1128 5.5867 27.1128 6.38C27.1128 7.1733 27.3361 7.84 27.7828 8.38C28.2361 8.9267 28.7861 9.2 29.4328 9.2C30.0795 9.2 30.6128 8.9267 31.0328 8.38M49.4328 17.9C49.4328 17.9 49.7161 18.2067 50.2828 18.82C50.8495 19.4333 51.1328 20.6133 51.1328 22.36C51.1328 24.1 50.5594 25.59 49.4128 26.83C48.2595 28.0766 46.8295 28.7 45.1228 28.7C43.4228 28.7 42.0028 28.0833 40.8628 26.85C39.7295 25.6233 39.1628 24.1366 39.1628 22.39C39.1628 20.65 39.7361 19.16 40.8828 17.92C42.0361 16.6733 43.4628 16.05 45.1628 16.05C46.8694 16.05 48.2928 16.6667 49.4328 17.9M46.8528 24.52C46.8528 24.52 46.9595 24.3833 47.1728 24.11C47.3795 23.8367 47.4828 23.3033 47.4828 22.51C47.4828 21.7167 47.2595 21.05 46.8128 20.51C46.3661 19.97 45.8162 19.7 45.1628 19.7C44.5161 19.7 43.9828 19.97 43.5628 20.51C43.1428 21.05 42.9328 21.7167 42.9328 22.51C42.9328 23.3033 43.1561 23.9733 43.6028 24.52C44.0494 25.06 44.5961 25.33 45.2428 25.33C45.8895 25.33 46.4261 25.06 46.8528 24.52Z" fill="currentColor"/></svg>`;

export default class TemplaterPlugin extends Plugin {
	public fuzzySuggest: TemplaterFuzzySuggestModal;
	public settings: TemplaterSettings; 
	public parser: TemplateParser

	async onload() {
		await this.loadSettings();

		this.fuzzySuggest = new TemplaterFuzzySuggestModal(this.app, this);
		this.parser = new TemplateParser(this.app, this);

		this.registerMarkdownPostProcessor((el, ctx) => this.dynamic_templates_processor(el, ctx));

		addIcon("templater-icon", ICON_DATA);
		this.addRibbonIcon('templater-icon', 'Templater', async () => {
			this.fuzzySuggest.insert_template();
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
				this.fuzzySuggest.insert_template();
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
				this.parser.replace_in_active_file();
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
				try {
					this.parser.cursor_jumper.jump_to_next_cursor_location();
				}
				catch(error) {
					this.log_error(error);
				}
			}
		});

		this.addCommand({
			id: "create-new-note-from-template",
			name: "Create new note from template",
			hotkeys: [
				{
					modifiers: ["Alt"],
					key: "n",
				},
			],
			callback: () => {
				this.fuzzySuggest.create_new_note_from_template();
			}
		});

		this.app.workspace.onLayoutReady(() => {
			this.registerEvent(
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
				})
			);
		});

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu: Menu, file: TFile) => {
				if (file instanceof TFolder) {
					menu.addItem((item: MenuItem) => {
						item.setTitle("Create new note from template")
							.setIcon("templater-icon")
							.onClick(evt => {
								this.fuzzySuggest.create_new_note_from_template(file);
							})
					});
				}
			})
		);

		this.addSettingTab(new TemplaterSettingTab(this.app, this));
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}	

	log_update(msg: string) {
		let notice = new Notice("", 15000);
		// TODO: Find better way for this
		// @ts-ignore
		notice.noticeEl.innerHTML = `<b>Templater update</b>: ${msg}`;
	}

	log_error(msg: string, error?: string) {
		let notice = new Notice("", 8000);
		if (error) {
			// TODO: Find a better way for this
			// @ts-ignore
			notice.noticeEl.innerHTML = `<b>Templater Error</b>: ${msg}<br/>Check console for more informations`;
			console.error(msg, error);
		}
		else {
			// @ts-ignore
			notice.noticeEl.innerHTML = `Templater Error: ${msg}`;
		}
	}

	async dynamic_templates_processor(el: HTMLElement, ctx: any) {
		if (el.textContent.contains("tp.dynamic")) {
			// TODO: This will not always be the active file, 
			// I need to use getFirstLinkpathDest and ctx to find the actual file
			let file = this.app.workspace.getActiveFile();

			await this.parser.setCurrentContext(file, ContextMode.DYNAMIC);
			let new_html = await this.parser.parseTemplates(el.innerHTML);

			el.innerHTML = new_html;
		}
	}
};