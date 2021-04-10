import { MarkdownView, Notice, Plugin, TAbstractFile, TFile } from 'obsidian';

import { DEFAULT_SETTINGS, TemplaterSettings, TemplaterSettingTab } from 'Settings';
import { TemplaterFuzzySuggestModal } from 'TemplaterFuzzySuggest';
import { ContextMode, TemplateParser } from 'TemplateParser';
import { delay } from 'TParser';

export default class TemplaterPlugin extends Plugin {
	public fuzzySuggest: TemplaterFuzzySuggestModal;
	public settings: TemplaterSettings; 
	public parser: TemplateParser

	async onload() {
		await this.loadSettings();

		// TODO: Remove this
		if (!this.settings.toggle_notice) {
			let notice = new Notice("", 15000);
			// @ts-ignore
			notice.noticeEl.innerHTML = `What? Templater is <b>evolving</b>!<br/>
	The template syntax changed in this release, check out the new documentation for it on <a href="https://github.com/SilentVoid13/Templater#templater-obsidian-plugin">Templater's Github</a> or in the community plugins page.<br/>
	Enjoy new features for Templater: new internal templates, user templates arguments, conditional statements and more.<br/>
	Every already existing feature still exists of course, you just need to update the syntax in your templates files.<br/>
	Thanks for using Templater! SilentVoid.<br/>
	You can also find this message in the settings of Templater. This message will self-destruct in the next update. You can disable this notice in the settings.`;
		}

		this.fuzzySuggest = new TemplaterFuzzySuggestModal(this.app, this);
		this.parser = new TemplateParser(this.app, this);

		this.registerMarkdownPostProcessor((el, ctx) => this.dynamic_templates_processor(el, ctx));

		this.addRibbonIcon('three-horizontal-bars', 'Templater', async () => {
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