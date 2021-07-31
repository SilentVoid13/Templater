import { addIcon, EventRef, Menu, MenuItem, normalizePath, Notice, Platform, Plugin, TAbstractFile, TFile, TFolder } from 'obsidian';

import { DEFAULT_SETTINGS, TemplaterSettings, TemplaterSettingTab } from 'Settings';
import { TemplaterFuzzySuggestModal } from 'TemplaterFuzzySuggest';
import { ICON_DATA } from 'Constants';
import { delay, resolveTFile } from 'Utils';
import { Templater } from 'Templater';
import { TemplaterError } from 'Error';
import { TemplaterEditor } from 'TemplaterEditor';

export default class TemplaterPlugin extends Plugin {
	public settings: TemplaterSettings; 
	public editor: TemplaterEditor;
	public templater: Templater;
	private fuzzySuggest: TemplaterFuzzySuggestModal;
	private trigger_on_file_creation_event: EventRef;
	private syntax_highlighting_event: EventRef;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.templater = new Templater(this.app, this);
		await this.templater.setup();

		this.editor = new TemplaterEditor(this.app, this);
		await this.editor.setup();
		this.update_syntax_highlighting();

		this.fuzzySuggest = new TemplaterFuzzySuggestModal(this.app, this);

		this.registerMarkdownPostProcessor((el, ctx) => this.templater.process_dynamic_templates(el, ctx));

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
				this.templater.overwrite_active_file_templates();
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
				this.templater.cursor_jumper.jump_to_next_cursor_location();
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
			this.update_trigger_file_on_creation();	
		});

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu: Menu, file: TFile) => {
				if (file instanceof TFolder) {
					menu.addItem((item: MenuItem) => {
						item.setTitle("Create new note from template")
							.setIcon("templater-icon")
							.onClick(_ => {
								this.fuzzySuggest.create_new_note_from_template(file);
							})
					});
				}
			})
		);

		this.addSettingTab(new TemplaterSettingTab(this.app, this));
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}	

	update_trigger_file_on_creation(): void {
		if (this.settings.trigger_on_file_creation) {
			this.trigger_on_file_creation_event = this.app.vault.on("create", async (file: TAbstractFile) => {
				if (!(file instanceof TFile) || file.extension !== "md") {
					return;
				}

				/* Avoids template replacement when syncing files */
				const template_folder = normalizePath(this.settings.template_folder);
				if (file.path.includes(template_folder) && template_folder !== "/") {
					return;
				}

				// TODO: find a better way to do this
				// Currently, I have to wait for the daily note plugin to add the file content before replacing
				// Not a problem with Calendar however since it creates the file with the existing content
				await delay(300);

				if (file.stat.size == 0 && this.settings.empty_file_template) {
					const template_file = await this.errorWrapper(async (): Promise<TFile> => {
						return resolveTFile(this.app, this.settings.empty_file_template + ".md");
					});
					if (!template_file) {
						return;
					}
					const content = await this.app.vault.read(template_file);
					await this.app.vault.modify(file, content);
				}
				this.templater.overwrite_file_templates(file);
			});
			this.registerEvent(this.trigger_on_file_creation_event);
		} else {
			if (this.trigger_on_file_creation_event) {
				this.app.vault.offref(this.trigger_on_file_creation_event);
				this.trigger_on_file_creation_event = undefined;
			}
		}
	}

	update_syntax_highlighting() {
		if (this.settings.syntax_highlighting) {
			this.syntax_highlighting_event = this.app.workspace.on("codemirror", cm => {
				cm.setOption("mode", "templater");
			});
			this.app.workspace.iterateCodeMirrors(cm => {
				cm.setOption("mode", "templater");
			});
			this.registerEvent(this.syntax_highlighting_event);
		} else {
			if (this.syntax_highlighting_event) {
				this.app.vault.offref(this.syntax_highlighting_event);
			}
			this.app.workspace.iterateCodeMirrors(cm => {
				cm.setOption("mode", "hypermd");
			});
		}
	}

	async errorWrapper(fn: Function): Promise<any> {
		try {
			return await fn();
		} catch(e) {
			if (!(e instanceof TemplaterError)) {
				this.log_error(new TemplaterError(`Template parsing error, aborting.`, e.message));
			} else {
				this.log_error(e);
			}
			return null;
		}
	}

	log_update(msg: string): void {
		const notice = new Notice("", 15000);
		// TODO: Find better way for this
		// @ts-ignore
		notice.noticeEl.innerHTML = `<b>Templater update</b>:<br/>${msg}`;
	}

	log_error(e: Error | TemplaterError): void {
		const notice = new Notice("", 8000);
		if (e instanceof TemplaterError && e.console_msg) {
			// TODO: Find a better way for this
			// @ts-ignore
			notice.noticeEl.innerHTML = `<b>Templater Error</b>:<br/>${e.message}<br/>Check console for more informations`;
			console.error(e.message, e.console_msg);
		}
		else {
			// @ts-ignore
			notice.noticeEl.innerHTML = `<b>Templater Error</b>:<br/>${e.message}`;
		}
	}	
};
