import TemplaterPlugin from "main";
import { Templater } from "Templater";
import { Settings } from "Settings";
import {
    App,
    EventRef,
    Menu,
    MenuItem,
    TAbstractFile,
    TFile,
    TFolder,
} from "obsidian";

export default class EventHandler {
    private syntax_highlighting_event: EventRef;
    private trigger_on_file_creation_event: EventRef;

    constructor(
        private app: App,
        private plugin: TemplaterPlugin,
        private templater: Templater,
        private settings: Settings
    ) {}

    setup(): void {
        this.app.workspace.onLayoutReady(() => {
            this.update_trigger_file_on_creation();
        });
        this.update_syntax_highlighting();
        this.update_file_menu();
    }

    update_syntax_highlighting(): void {
        if (this.plugin.settings.syntax_highlighting) {
            this.syntax_highlighting_event = this.app.workspace.on(
                "codemirror",
                (cm) => {
                    cm.setOption("mode", "templater");
                }
            );
            this.app.workspace.iterateCodeMirrors((cm) => {
                cm.setOption("mode", "templater");
            });
            this.plugin.registerEvent(this.syntax_highlighting_event);
        } else {
            if (this.syntax_highlighting_event) {
                this.app.vault.offref(this.syntax_highlighting_event);
            }
            this.app.workspace.iterateCodeMirrors((cm) => {
                cm.setOption("mode", "hypermd");
            });
        }
    }

    update_trigger_file_on_creation(): void {
        if (this.settings.trigger_on_file_creation) {
            this.trigger_on_file_creation_event = this.app.vault.on(
                "create",
                (file: TAbstractFile) =>
                    Templater.on_file_creation(this.templater, file)
            );
            this.plugin.registerEvent(this.trigger_on_file_creation_event);
        } else {
            if (this.trigger_on_file_creation_event) {
                this.app.vault.offref(this.trigger_on_file_creation_event);
                this.trigger_on_file_creation_event = undefined;
            }
        }
    }

    update_file_menu(): void {
        this.plugin.registerEvent(
            this.app.workspace.on("file-menu", (menu: Menu, file: TFile) => {
                if (file instanceof TFolder) {
                    menu.addItem((item: MenuItem) => {
                        item.setTitle("Create new note from template")
                            .setIcon("templater-icon")
                            .onClick(() => {
                                this.plugin.fuzzy_suggester.create_new_note_from_template(
                                    file
                                );
                            });
                    });
                }
            })
        );
    }
}
