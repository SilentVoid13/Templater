import { addIcon, MarkdownView, Menu, MenuItem, Notice, Plugin, TAbstractFile, TFile, TFolder } from 'obsidian';

import { DEFAULT_SETTINGS, TemplaterSettings, TemplaterSettingTab } from 'Settings';
import { TemplaterFuzzySuggestModal } from 'TemplaterFuzzySuggest';
import { ContextMode, TemplateParser } from 'TemplateParser';
import { ICON_DATA } from 'Constants';
import { delay } from 'Utils';

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
			notice.noticeEl.innerHTML = `<b>Templater Error</b>: ${msg}`;
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