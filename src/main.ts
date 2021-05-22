import { addIcon, EventRef, Menu, MenuItem, Notice, Plugin, TAbstractFile, TFile, TFolder } from 'obsidian';

import { DEFAULT_SETTINGS, TemplaterSettings, TemplaterSettingTab } from 'Settings';
import { TemplaterFuzzySuggestModal } from 'TemplaterFuzzySuggest';
import { ICON_DATA } from 'Constants';
import { delay, resolveTFile } from 'Utils';
import { Templater } from 'Templater';
import { TemplaterError } from 'Error';

export default class TemplaterPlugin extends Plugin {
	public settings: TemplaterSettings; 
	public templater: Templater;
	private fuzzySuggest: TemplaterFuzzySuggestModal;
	private trigger_on_file_creation_event: EventRef;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.templater = new Templater(this.app, this);
		await this.templater.setup();

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
			// TODO
			//this.registerCodeMirrorMode();
			this.update_trigger_file_on_creation();	
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
			this.registerEvent(
				this.trigger_on_file_creation_event
			);
		}
		else {
			if (this.trigger_on_file_creation_event) {
				this.app.vault.offref(this.trigger_on_file_creation_event);
				this.trigger_on_file_creation_event = undefined;
			}
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

	/*
	// TODO
	registerCodeMirrorMode() {
		// https://codemirror.net/doc/manual.html#modeapi
		// cm-editor-syntax-highlight-obsidian plugin
		// https://codemirror.net/mode/diff/diff.js
		// https://marijnhaverbeke.nl/blog/codemirror-mode-system.html

		const hypermd_mode = window.CodeMirror.getMode({}, "hypermd");
		const javascript_mode = window.CodeMirror.getMode({}, "javascript");

		window.CodeMirror.extendMode("hypermd", {
			startState: function() {
				const hypermd_state = window.CodeMirror.startState(hypermd_mode);
				const js_state = javascript_mode ? window.CodeMirror.startState(javascript_mode): {};
				return {
					...hypermd_state,
					...js_state,
					inCommand: false
				};
			},
			copyState: function(state) {
				const hypermd_state: {} = hypermd_mode.copyState(state);
				const js_state = javascript_mode ? window.CodeMirror.startState(javascript_mode): {};
				const new_state = {
					...hypermd_state,
					...js_state,
					inCommand: state.inCommand
				};
				return new_state;
			},
			// TODO: Fix conflicts with links
			token: function(stream, state) {
				if (stream.match(/<%[*~]{0,1}[-_]{0,1}/)) {
					state.inCommand = true;
					return "formatting formatting-code inline-code";
				}

				if (state.inCommand) {
					if (stream.match(/[-_]{0,1}%>/m, true)) {
						state.inCommand = false;
						return "formatting formatting-code inline-code";
					}

					let keywords = "hmd-codeblock line-testtest";
					if (javascript_mode) {
						const js_result = javascript_mode.token(stream, state);
						if (js_result) {
							keywords +=  " " + js_result;
						}
					}
					return keywords;
				} 

				const result = hypermd_mode.token(stream, state);
				return result;
			},
		});
	}
	*/
};