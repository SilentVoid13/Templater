import TemplaterPlugin from "main";
import { normalizePath, Platform, TFile, TFolder } from "obsidian";
import { errorWrapperSync } from "utils/Error";
import { resolve_tfile, resolve_tfolder, get_folder_path_from_file_path } from "utils/Utils";

export class CommandHandler {
    constructor(private plugin: TemplaterPlugin) {}

    setup(): void {
        this.plugin.addCommand({
            id: "insert-templater",
            name: "Open insert template modal",
            icon: "templater-icon",
            hotkeys: Platform.isMacOS
                ? undefined
                : [
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
            icon: "templater-icon",
            hotkeys: Platform.isMacOS
                ? undefined
                : [
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
            icon: "text-cursor",
            hotkeys: [
                {
                    modifiers: ["Alt"],
                    key: "Tab",
                },
            ],
            callback: () => {
                this.plugin.editor_handler.jump_to_next_cursor_location();
            },
        });

        this.plugin.addCommand({
            id: "create-new-note-from-template",
            name: "Create new note from template",
            icon: "templater-icon",
            hotkeys: Platform.isMacOS
                ? undefined
                : [
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
        this.register_cli_handler();
    }

    register_templates_hotkeys(): void {
        this.plugin.settings.enabled_templates_hotkeys.forEach((template) => {
            if (template) {
                this.add_template_hotkey(null, template);
            }
        });
    }

    add_template_hotkey(
        old_template: string | null,
        new_template: string
    ): void {
        this.remove_template_hotkey(old_template);

        if (new_template) {
            // Determine started index based on templates folder
            const template_start_index = this.plugin.settings.templates_folder ?
                this.plugin.settings.templates_folder.length + 1 :
                0;

            const new_template_name = new_template.slice(
                template_start_index,
                -3
            );

            this.plugin.addCommand({
                id: new_template,
                name: `Insert ${new_template_name}`,
                icon: "templater-icon",
                callback: () => {
                    const template = errorWrapperSync(
                        () => resolve_tfile(this.plugin.app, new_template),
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
            this.plugin.addCommand({
                id: `create-${new_template}`,
                name: `Create ${new_template_name}`,
                icon: "templater-icon",
                callback: () => {
                    const template = errorWrapperSync(
                        () => resolve_tfile(this.plugin.app, new_template),
                        `Couldn't find the template file associated with this hotkey`
                    );
                    if (!template) {
                        return;
                    }
                    this.plugin.templater.create_new_note_from_template(
                        template
                    );
                },
            });
        }
    }

    remove_template_hotkey(template: string | null): void {
        if (template) {
            this.plugin.removeCommand(`${template}`);
            this.plugin.removeCommand(`create-${template}`);
        }
    }

    register_cli_handler(): void {
        this.plugin.registerCliHandler(
            "templater:create-from-template",
            "Create a new note from a Templater template",
            {
                template: {
                    value: "<path>",
                    description: "Template file path (relative to vault root or templates folder)",
                    required: true,
                },
                file: {
                    value: "<path>",
                    description: "Output file path (relative to vault root)",
                    required: true,
                },
                open: {
                    description: "Open the created file in the UI",
                    required: false,
                },
            },
            async (params) => this.handle_create_from_template(params)
        );
    }

    private resolve_template_file(template: string): TFile {
        let template_path = template;
        if (!template_path.endsWith(".md")) {
            template_path = `${template_path}.md`;
        }

        try {
            return resolve_tfile(this.plugin.app, template_path);
        } catch {
            const templates_folder = this.plugin.settings.templates_folder;
            if (templates_folder) {
                const full_path = normalizePath(`${templates_folder}/${template_path}`);
                return resolve_tfile(this.plugin.app, full_path);
            }
            throw new Error(`Template "${template}" not found`);
        }
    }

    private async handle_create_from_template(
        params: Record<string, string | "true">
    ): Promise<string> {
        const { template, file, open } = params;

        if (!template) {
            return "Error: template parameter is required";
        }
        if (!file) {
            return "Error: file parameter is required";
        }

        try {
            const template_file = this.resolve_template_file(template);

            const file_path = normalizePath(file);
            const folder_path = get_folder_path_from_file_path(file_path);
            const filename = file_path.slice(folder_path.length + 1).replace(/\.md$/, "");

            let folder: TFolder | undefined;
            if (folder_path) {
                try {
                    folder = resolve_tfolder(this.plugin.app, folder_path);
                } catch {
                    // Folder will be created by create_new_note_from_template
                }
            }

            const open_note = open === "true";
            const created_file = await this.plugin.templater.create_new_note_from_template(
                template_file,
                folder ?? folder_path,
                filename,
                open_note
            );

            if (created_file) {
                return created_file.path;
            }
            return "Error: Failed to create note from template";
        } catch (error) {
            return `Error: ${error instanceof Error ? error.message : String(error)}`;
        }
    }
}
