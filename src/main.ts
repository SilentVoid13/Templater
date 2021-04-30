import { addIcon, EventRef, Menu, MenuItem, Notice, Plugin, TAbstractFile, TFile, TFolder } from 'obsidian';

import { DEFAULT_SETTINGS, TemplaterSettings, TemplaterSettingTab } from 'Settings';
import { TemplaterFuzzySuggestModal } from 'TemplaterFuzzySuggest';
import { ICON_DATA } from 'Constants';
import { delay } from 'Utils';
import { Templater } from 'Templater';

export default class TemplaterPlugin extends Plugin {
	public settings: TemplaterSettings; 
	public templater: Templater;
	private fuzzySuggest: TemplaterFuzzySuggestModal;
	private trigger_on_file_creation_event: EventRef;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.templater = new Templater(this.app, this);
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
				try {
					this.templater.cursor_jumper.jump_to_next_cursor_location();
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
				console.log("TRIGGERED TRIGGERED");
				// TODO: find a better way to do this
				// Currently, I have to wait for the daily note plugin to add the file content before replacing
				// Not a problem with Calendar however since it creates the file with the existing content
				await delay(300);
				if (!(file instanceof TFile) || file.extension !== "md") {
					return;
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

	log_update(msg: string): void {
		const notice = new Notice("", 15000);
		// TODO: Find better way for this
		// @ts-ignore
		notice.noticeEl.innerHTML = `<b>Templater update</b>:<br/>${msg}`;
	}

	log_error(msg: string, error?: string): void {
		const notice = new Notice("", 8000);
		if (error) {
			// TODO: Find a better way for this
			// @ts-ignore
			notice.noticeEl.innerHTML = `<b>Templater Error</b>:<br/>${msg}<br/>Check console for more informations`;
			console.error(msg, error);
		}
		else {
			// @ts-ignore
			notice.noticeEl.innerHTML = `<b>Templater Error</b>:<br/>${msg}`;
		}
	}	

	/*
	async registerCodeMirrorMode() {
		// https://codemirror.net/doc/manual.html#modeapi
		// cm-editor-syntax-highlight-obsidian plugin
		// https://codemirror.net/mode/diff/diff.js
		// https://marijnhaverbeke.nl/blog/codemirror-mode-system.html

		await delay(1500);
		window.CodeMirror.defineMode("templater", function() {
			return {
			  startState: function() {return {inString: false};},
			  token: function(stream, state) {
				// If a string starts here
				if (!state.inString && stream.peek() == '"') {
				  stream.next();            // Skip quote
				  state.inString = true;    // Update state
				}
		  
				if (state.inString) {
				  if (stream.skipTo('"')) { // Quote found on this line
					stream.next();          // Skip quote
					state.inString = false; // Clear flag
				  } else {
					 stream.skipToEnd();    // Rest of line is string
				  }
				  return "string";          // Token style
				} else {
				  stream.skipTo('"') || stream.skipToEnd();
				  return null;              // Unstyled token
				}
			  },
			};
		});
		//window.CodeMirror.defineMIME("text/x-templater", "templater");
			  
		this.app.workspace.iterateCodeMirrors(cm => {
			cm.setOption("mode", "templater")
			console.log(cm.getOption("mode"));
		});
	}
	*/
};