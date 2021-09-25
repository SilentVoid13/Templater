import { addIcon, Notice, Plugin } from 'obsidian';

import { DEFAULT_SETTINGS, Settings, TemplaterSettingTab } from 'Settings';
import { FuzzySuggester } from 'FuzzySuggester';
import { ICON_DATA } from 'Constants';
import { Templater } from 'Templater';
import { TemplaterError } from 'Error';
import EventHandler from 'EventHandler';

export default class TemplaterPlugin extends Plugin {
	public settings: Settings; 
	public templater: Templater;
    public event_handler: EventHandler;
	public fuzzy_suggester: FuzzySuggester;

	async onload(): Promise<void> {
		await this.load_settings();

		this.templater = new Templater(this.app, this);
		await this.templater.setup();

		this.fuzzy_suggester = new FuzzySuggester(this.app, this);

        this.event_handler = new EventHandler(this.app, this, this.templater, this.settings);
        this.event_handler.setup();

        this.register_commands();

		addIcon("templater-icon", ICON_DATA);
		this.addRibbonIcon('templater-icon', 'Templater', async () => {
			this.fuzzy_suggester.insert_template();
		});

		this.addSettingTab(new TemplaterSettingTab(this.app, this));
	}

	async save_settings(): Promise<void> {
		await this.saveData(this.settings);
	}

	async load_settings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

    register_commands(): void {
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
				this.fuzzy_suggester.insert_template();
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
				this.templater.overwrite_active_file_commands();
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
				this.templater.editor.jump_to_next_cursor_location();
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
				this.fuzzy_suggester.create_new_note_from_template();
			}
		});
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
