import { App } from "obsidian";

import TemplaterPlugin from "main";
import { resolve_tfile } from "Utils";
import { errorWrapperSync } from "Error";

export class CommandHandler {
    constructor(private app: App, private plugin: TemplaterPlugin) {}

    setup(): void {
        this.plugin.addCommand({
            id: "insert-templater",
            name: "Open Insert Template modal",
            hotkeys: [
                {
                    modifiers: ["Alt"],
                    key: "e",
                },
            ],
            callback: () => {
                this.plugin.fuzzy_suggester.insert_template();
            },
        });

        this.plugin.addCommand({
            id: "replace-in-file-templater",
            name: "Replace templates in the active file",
            hotkeys: [
                {
                    modifiers: ["Alt"],
                    key: "r",
                },
            ],
            callback: () => {
                this.plugin.templater.overwrite_active_file_commands();
            },
        });

        this.plugin.addCommand({
            id: "jump-to-next-cursor-location",
            name: "Jump to next cursor location",
            hotkeys: [
                {
                    modifiers: ["Alt"],
                    key: "Tab",
                },
            ],
            callback: () => {
                this.plugin.templater.editor.jump_to_next_cursor_location();
            },
        });

        this.plugin.addCommand({
            id: "create-new-note-from-template",
            name: "Create new note from template",
            hotkeys: [
                {
                    modifiers: ["Alt"],
                    key: "n",
                },
            ],
            callback: () => {
                this.plugin.fuzzy_suggester.create_new_note_from_template();
            },
        });

        this.register_templates_hotkeys();
    }

    register_templates_hotkeys(): void {
        this.plugin.settings.enabled_templates_hotkeys.forEach((template) => {
            if (template) {
                this.add_template_hotkey(null, template);
            }
        });
    }

    add_template_hotkey(old_template: string, new_template: string): void {
        this.remove_template_hotkey(old_template);

        if (new_template) {
            this.plugin.addCommand({
                id: new_template,
                name: `Insert ${new_template}`,
                callback: () => {
                    const template = errorWrapperSync(
                        () => resolve_tfile(this.app, new_template),
                        `Couldn't find the template file associated with this hotkey`
                    );
                    if (!template) {
                        return;
                    }
                    this.plugin.templater.append_template_to_active_file(
                        template
                    );
                },
            });
        }
    }

    remove_template_hotkey(template: string): void {
        if (template) {
            // TODO: Find official way to do this
            // @ts-ignore
            this.app.commands.removeCommand(
                `${this.plugin.manifest.id}:${template}`
            );
        }
    }
}
