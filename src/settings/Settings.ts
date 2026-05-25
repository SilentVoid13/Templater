import TemplaterPlugin from "main";
import {
    Setting,
    type SettingDefinition,
    type SettingDefinitionItem,
    type SettingDefinitionGroup,
    type SettingDefinitionList,
    type SettingGroupItem,
    PluginSettingTab,
} from "obsidian";
import { errorWrapperSync, TemplaterError } from "utils/Error";
import { log_error } from "utils/Log";
import { arraymove, get_tfiles_from_folder } from "utils/Utils";
import { FileSuggest, FileSuggestMode } from "./suggesters/FileSuggester";
import { FolderSuggest } from "./suggesters/FolderSuggester";
import { IntellisenseRenderOption } from "./RenderSettings/IntellisenseRenderOption";
import { set } from "utils/set";
import { get, type Paths } from "utils/get";

export interface FolderTemplate {
    folder: string;
    template: string;
}

export interface FileTemplate {
    regex: string;
    template: string;
}

export interface IgnoreFolderOnCreation {
    folder: string;
}

export const DEFAULT_SETTINGS: Settings = {
    command_timeout: 5,
    templates_folder: "",
    templates_pairs: [["", ""]],
    trigger_on_file_creation: false,
    trigger_on_file_creation_mode: "none",
    auto_jump_to_cursor: false,
    enable_system_commands: false,
    shell_path: "",
    user_scripts_folder: "",
    // enable_folder_templates: true,
    folder_templates: [{ folder: "", template: "" }],
    // enable_file_templates: false,
    file_templates: [{ regex: ".*", template: "" }],
    syntax_highlighting: true,
    syntax_highlighting_mobile: false,
    enabled_templates_hotkeys: [""],
    startup_templates: [""],
    enable_startup_templates: true,
    intellisense_render:
        IntellisenseRenderOption.RenderDescriptionParameterReturn,
    ignore_folders_on_creation: [{ folder: "" }],
};

export interface Settings {
    templates_folder: string;
    syntax_highlighting: boolean;
    syntax_highlighting_mobile: boolean;
    auto_jump_to_cursor: boolean;
    trigger_on_file_creation: boolean;
    trigger_on_file_creation_mode: "none" | "folder" | "regex";
    folder_templates: Array<FolderTemplate>;
    file_templates: Array<FileTemplate>;
    ignore_folders_on_creation: Array<IgnoreFolderOnCreation>;
    command_timeout: number;
    templates_pairs: Array<[string, string]>;
    enable_system_commands: boolean;
    shell_path: string;
    user_scripts_folder: string;
    enabled_templates_hotkeys: Array<string>;
    startup_templates: Array<string>;
    enable_startup_templates: boolean;
    intellisense_render: number;
}

export class TemplaterSettingTab extends PluginSettingTab {
    icon = "templater-icon";

    constructor(private plugin: TemplaterPlugin) {
        super(plugin.app, plugin);
    }

    getControlValue(key: Paths<Settings>): unknown {
        return get(this.plugin.settings, key);
    }

    // Overriding `setControlValue` to trigger UI changes on save, either in editor or in settings tab
    async setControlValue<K extends keyof Settings>(
        key: K,
        value: Settings[K],
    ) {
        set(this.plugin.settings, key, value);
        const rerenderKeys = [
            "trigger_on_file_creation",
            "trigger_on_file_creation_mode",
            "enable_startup_templates",
        ];
        if (rerenderKeys.contains(key)) {
            this.update();
        }
        await this.plugin.save_settings();
    }

    getSettingDefinitions(): SettingDefinitionItem<keyof Settings>[] {
        const items: SettingDefinitionItem<keyof Settings>[] = [];

        const autoJumpDesc = createFragment();
        autoJumpDesc.append(
            "Automatically triggers ",
            // eslint-disable-next-line obsidianmd/ui/sentence-case -- Inline code identifier, not a UI label
            autoJumpDesc.createEl("code", { text: "tp.file.cursor" }),
            " after inserting a template.",
            autoJumpDesc.createEl("br"),
            "You can also set a hotkey to manually trigger ",
            // eslint-disable-next-line obsidianmd/ui/sentence-case -- Inline code identifier, not a UI label
            autoJumpDesc.createEl("code", { text: "tp.file.cursor" }),
            ".",
        );

        const internalFunctionsDesc = createFragment();
        internalFunctionsDesc.append(
            "Templater provides multiples predefined variables / functions that you can use.",
            internalFunctionsDesc.createEl("br"),
            "Check the ",
            internalFunctionsDesc.createEl("a", {
                href: "https://silentvoid13.github.io/Templater/",
                // eslint-disable-next-line obsidianmd/ui/sentence-case -- Inline link text within a sentence, not a standalone UI label
                text: "documentation",
            }),
            " to get a list of all the available internal variables / functions.",
        );

        items.push({
            type: "group",
            items: [
                {
                    name: "Internal variables and functions",
                    desc: internalFunctionsDesc,
                },
                {
                    name: "Template folder location",
                    desc: "Files in this folder will be available as templates.",
                    control: {
                        type: "folder",
                        key: "templates_folder",
                    },
                },
                {
                    type: "page",
                    name: "Template hotkeys",
                    desc: "Bind templates to hotkeys.",
                    items: [this.templateHotkeysGroup()],
                },
                {
                    name: "Automatic jump to cursor",
                    desc: autoJumpDesc,
                    control: { type: "toggle", key: "auto_jump_to_cursor" },
                },
            ],
        });

        items.push({
            type: "group",
            heading: "Syntax highlighting",
            items: [
                {
                    name: "Syntax highlighting on desktop",
                    desc: "Adds syntax highlighting for Templater commands in edit mode.",
                    control: {
                        type: "toggle",
                        key: "syntax_highlighting",
                    },
                },
                {
                    name: "Syntax highlighting on mobile",
                    desc: "Adds syntax highlighting for Templater commands in edit mode on mobile. Use with caution: this may break live preview on mobile platforms.",
                    control: {
                        type: "toggle",
                        key: "syntax_highlighting_mobile",
                    },
                },
            ],
        });

        items.push({
            type: "group",
            heading: "File creation",
            items: this.fileCreationGroup(),
        });

        // Group: Startup templates
        const startupTemplatesDesc = createFragment();
        startupTemplatesDesc.append(
            "Enables templates to run automatically when Templater starts.",
            startupTemplatesDesc.createEl("br"),
            startupTemplatesDesc.createEl("br"),
            startupTemplatesDesc.createEl("b", {
                text: "Warning: ",
                cls: "mod-warning",
            }),
            "This can be dangerous if you set a startup template with unknown / unsafe content. Make sure that every startup template's content is safe.",
        );
        items.push({
            type: "group",
            heading: "Startup templates",
            items: [
                {
                    name: "Enable startup templates",
                    desc: startupTemplatesDesc,
                    control: {
                        type: "toggle",
                        key: "enable_startup_templates",
                    },
                },
                {
                    type: "page",
                    name: "Startup templates",
                    desc: "Templates that run once when Templater starts. These output nothing and are useful for setting up event hooks.",
                    items: [this.startupTemplatesGroup()],
                    visible: () =>
                        this.plugin.settings.enable_startup_templates,
                },
            ],
        });

        // Group: User scripts
        items.push({
            type: "group",
            heading: "User scripts",
            items: this.userScriptItems(),
        });

        // Group: User system commands
        items.push({
            type: "group",
            heading: "User system commands",
            items: this.systemCommandItems(),
        });

        return items;
    }

    private fileCreationGroup(): SettingGroupItem<keyof Settings>[] {
        const s = this.plugin.settings;

        const triggerDesc = createFragment();
        triggerDesc.append(
            "Templater will listen for the new file creation event, and, if it matches a rule you've set, replace every command it finds in the new file's content. ",
            "This makes Templater compatible with other plugins like the Daily note core plugin, Calendar plugin, Review plugin, Note refactor plugin, etc. ",
            triggerDesc.createEl("br"),
            triggerDesc.createEl("br"),
            triggerDesc.createEl("b", {
                text: "Warning: ",
                cls: "mod-warning",
            }),
            "This can be dangerous if you create new files with unknown / unsafe content on creation. Make sure that every new file's content is safe on creation.",
        );
        const modeDescList = createEl("ul");
        modeDescList.appendChild(
            createEl("li", {
                text: "None: Do not auto apply templates. Templater will still listen for the new file creation event and replace every command it finds in the new file's content.",
            }),
        );
        modeDescList.appendChild(
            createEl("li", {
                text: "Folder templates: Apply templates based on folder structure.",
            }),
        );
        modeDescList.appendChild(
            createEl("li", {
                text: "File regex templates: Apply templates based on regex file name patterns.",
            }),
        );
        const modeDesc = createFragment();
        modeDesc.append(
            "Choose the matching mode for triggering templates on file creation.",
            modeDesc.createEl("br"),
            modeDescList,
        );

        const folderTriggerDesc = createFragment();
        folderTriggerDesc.append(
            "If there is a match, Templater will apply the corresponding template to the new file.",
            folderTriggerDesc.createEl("br"),
            "Folder templates are processed in order, so if a file matches multiple folder templates, only the first match will be applied.",
            folderTriggerDesc.createEl("br"),
            "Add a rule for ",
            folderTriggerDesc.createEl("code", { text: "/" }),
            " if you need a catch-all.",
        );

        const fileRegexTriggerDesc = createFragment();
        fileRegexTriggerDesc.append(
            "File regex templates are applied based on the regex file path patterns you define.",
            fileRegexTriggerDesc.createEl("br"),
            "File regex templates are processed in order, so if a file matches multiple regex templates, only the first match will be applied.",
            fileRegexTriggerDesc.createEl("br"),
            "Add a rule for ",
            fileRegexTriggerDesc.createEl("code", { text: ".*" }),
            " if you need a catch-all.",
        );

        return [
            {
                name: "Trigger Templater on new file creation",
                desc: triggerDesc,
                control: {
                    type: "toggle",
                    key: "trigger_on_file_creation",
                },
            },
            {
                type: "page",
                name: "Ignore folders on file creation",
                desc: "New files created in these folders will never trigger Templater.",
                items: [this.ignoreFoldersGroup()],
                visible: () => s.trigger_on_file_creation,
            },
            {
                name: "Template matching mode",
                desc: modeDesc,
                control: {
                    type: "dropdown",
                    key: "trigger_on_file_creation_mode",
                    options: {
                        none: "None",
                        folder: "Folder templates",
                        regex: "File regex templates",
                    },
                },
                visible: () => s.trigger_on_file_creation,
            },
            {
                type: "page",
                name: "Folder templates",
                desc: folderTriggerDesc,
                items: [this.folderTemplatesGroup()],
                visible: () =>
                    s.trigger_on_file_creation &&
                    s.trigger_on_file_creation_mode === "folder",
            },
            {
                type: "page",
                name: "File regex templates",
                desc: fileRegexTriggerDesc,
                items: [this.fileTemplatesGroup()],
                visible: () =>
                    s.trigger_on_file_creation &&
                    s.trigger_on_file_creation_mode === "regex",
            },
        ];
    }

    private ignoreFoldersGroup(): SettingDefinitionList<keyof Settings> {
        return {
            type: "list",
            addItem: {
                name: "Add folder",
                action: () => {
                    this.plugin.settings.ignore_folders_on_creation.push({
                        folder: "",
                    });
                    this.update();
                    void this.plugin.save_settings();
                },
            },
            onReorder: (oldIndex, newIndex) => {
                arraymove(
                    this.plugin.settings.ignore_folders_on_creation,
                    oldIndex,
                    newIndex,
                );
                this.update();
                void this.plugin.save_settings();
            },
            onDelete: (index) => {
                this.plugin.settings.ignore_folders_on_creation.splice(
                    index,
                    1,
                );
                this.update();
                void this.plugin.save_settings();
            },
            items: [
                ...this.plugin.settings.ignore_folders_on_creation.map(
                    (_, index): SettingDefinition<keyof Settings> => ({
                        name: "Folder",
                        searchable: false,
                        control: {
                            type: "folder",
                            key: `ignore_folders_on_creation.${index}.folder` as keyof Settings,
                            validate: (value: string) => {
                                if (!value) {
                                    return "This field cannot be empty";
                                }
                                if (
                                    this.plugin.settings.ignore_folders_on_creation.some(
                                        (e, i) =>
                                            e.folder === value && i !== index,
                                    )
                                ) {
                                    return "This folder is already in the ignore list";
                                }
                                return undefined;
                            },
                        },
                    }),
                ),
            ],
        };
    }

    private folderTemplatesGroup(): SettingDefinitionList<keyof Settings> {
        return {
            type: "list",
            addItem: {
                name: "Add folder template",
                action: () => {
                    this.plugin.settings.folder_templates.push({
                        folder: "",
                        template: "",
                    });
                    this.update();
                    void this.plugin.save_settings();
                },
            },
            onReorder: (oldIndex, newIndex) => {
                arraymove(
                    this.plugin.settings.folder_templates,
                    oldIndex,
                    newIndex,
                );
                this.update();
                void this.plugin.save_settings();
            },
            onDelete: (index) => {
                this.plugin.settings.folder_templates.splice(index, 1);
                this.update();
                void this.plugin.save_settings();
            },
            items: this.plugin.settings.folder_templates.map(
                (folder_template, index) => ({
                    name: "Folder template",
                    searchable: false,
                    render: (setting: Setting) => {
                        setting.addSearch((cb) => {
                            new FolderSuggest(this.app, cb.inputEl);
                            cb.setPlaceholder("Folder")
                                .setValue(folder_template.folder)
                                .onChange(async (new_folder) => {
                                    if (
                                        new_folder &&
                                        this.plugin.settings.folder_templates.some(
                                            (e) => e.folder === new_folder,
                                        )
                                    ) {
                                        log_error(
                                            new TemplaterError(
                                                "This folder already has a template associated with it",
                                            ),
                                        );
                                        return;
                                    }
                                    this.plugin.settings.folder_templates[
                                        index
                                    ].folder = new_folder;
                                    await this.plugin.save_settings();
                                });
                        });
                        setting.addSearch((cb) => {
                            new FileSuggest(
                                cb.inputEl,
                                this.plugin,
                                FileSuggestMode.TemplateFiles,
                            );
                            cb.setPlaceholder("Template")
                                .setValue(folder_template.template)
                                .onChange(async (new_template) => {
                                    this.plugin.settings.folder_templates[
                                        index
                                    ].template = new_template;
                                    await this.plugin.save_settings();
                                });
                        });
                    },
                }),
            ),
        };
    }

    private fileTemplatesGroup(): SettingDefinitionList<keyof Settings> {
        const s = this.plugin.settings;

        return {
            type: "list",
            addItem: {
                name: "Add file regex template",
                action: () => {
                    s.file_templates.push({ regex: "", template: "" });
                    this.update();
                    void this.plugin.save_settings();
                },
            },
            onReorder: (oldIndex, newIndex) => {
                arraymove(s.file_templates, oldIndex, newIndex);
                this.update();
                void this.plugin.save_settings();
            },
            onDelete: (index) => {
                s.file_templates.splice(index, 1);
                this.update();
                void this.plugin.save_settings();
            },
            items: s.file_templates.map((file_template, index) => ({
                name: "File regex template",
                searchable: false,
                render: (setting: Setting) => {
                    setting.addText((cb) => {
                        cb.setPlaceholder("File regex")
                            .setValue(file_template.regex)
                            .onChange(async (new_regex) => {
                                s.file_templates[index].regex = new_regex;
                                await this.plugin.save_settings();
                            });
                    });
                    setting.addSearch((cb) => {
                        new FileSuggest(
                            cb.inputEl,
                            this.plugin,
                            FileSuggestMode.TemplateFiles,
                        );
                        cb.setPlaceholder("Template")
                            .setValue(file_template.template)
                            .onChange(async (new_template) => {
                                s.file_templates[index].template = new_template;
                                await this.plugin.save_settings();
                            });
                    });
                },
            })),
        };
    }

    private templateHotkeysGroup(): SettingDefinitionList<keyof Settings> {
        const s = this.plugin.settings;

        return {
            type: "list",
            addItem: {
                name: "Add new hotkey for template",
                action: () => {
                    s.enabled_templates_hotkeys.push("");
                    this.update();
                    void this.plugin.save_settings();
                },
            },
            onReorder: (oldIndex, newIndex) => {
                arraymove(s.enabled_templates_hotkeys, oldIndex, newIndex);
                this.update();
                void this.plugin.save_settings();
            },
            onDelete: (index) => {
                this.plugin.command_handler.remove_template_hotkey(
                    s.enabled_templates_hotkeys[index],
                );
                s.enabled_templates_hotkeys.splice(index, 1);
                this.update();
                void this.plugin.save_settings();
            },
            items: s.enabled_templates_hotkeys.map((template, index) => ({
                name: template || "Template hotkey",
                searchable: false,
                render: (setting: Setting) => {
                    setting.addSearch((cb) => {
                        new FileSuggest(
                            cb.inputEl,
                            this.plugin,
                            FileSuggestMode.TemplateFiles,
                        );
                        cb.setPlaceholder("Example: folder1/template_file")
                            .setValue(template)
                            .onChange(async (new_template) => {
                                if (
                                    new_template &&
                                    s.enabled_templates_hotkeys.contains(
                                        new_template,
                                    )
                                ) {
                                    log_error(
                                        new TemplaterError(
                                            "This template is already bound to a hotkey",
                                        ),
                                    );
                                    return;
                                }
                                this.plugin.command_handler.add_template_hotkey(
                                    s.enabled_templates_hotkeys[index],
                                    new_template,
                                );
                                s.enabled_templates_hotkeys[index] =
                                    new_template;
                                await this.plugin.save_settings();
                            });
                    });
                    setting.addExtraButton((cb) =>
                        cb
                            .setIcon("any-key")
                            .setTooltip("Configure hotkey")
                            .onClick(() => {
                                // TODO: Replace with future "official" way to do this
                                this.app.setting.openTabById("hotkeys");
                                const tab = this.app.setting.activeTab;
                                tab.searchComponent.inputEl.value = template;
                                tab.updateHotkeyVisibility();
                            }),
                    );
                },
            })),
        };
    }

    private startupTemplatesGroup(): SettingDefinitionList<keyof Settings> {
        const s = this.plugin.settings;

        return {
            type: "list",
            addItem: {
                name: "Add new startup template",
                action: () => {
                    s.startup_templates.push("");
                    this.update();
                    void this.plugin.save_settings();
                },
            },
            onDelete: (index) => {
                s.startup_templates.splice(index, 1);
                this.update();
                void this.plugin.save_settings();
            },
            items: [
                ...s.startup_templates.map((template, index) => ({
                    name: template || "Startup template",
                    searchable: false,
                    render: (setting: Setting) => {
                        setting.addSearch((cb) => {
                            new FileSuggest(
                                cb.inputEl,
                                this.plugin,
                                FileSuggestMode.TemplateFiles,
                            );
                            cb.setPlaceholder("Example: folder1/template_file")
                                .setValue(template)
                                .onChange(async (new_template) => {
                                    if (
                                        new_template &&
                                        s.startup_templates.contains(
                                            new_template,
                                        )
                                    ) {
                                        log_error(
                                            new TemplaterError(
                                                "This startup template already exist",
                                            ),
                                        );
                                        return;
                                    }
                                    s.startup_templates[index] = new_template;
                                    await this.plugin.save_settings();
                                });
                        });
                    },
                })),
            ],
        };
    }

    private userScriptItems(): SettingGroupItem<keyof Settings>[] {
        const s = this.plugin.settings;
        const items: SettingGroupItem<keyof Settings>[] = [];

        // Script folder location
        items.push({
            name: "Script files folder location",
            desc: (() => {
                const desc = createFragment();
                desc.append(
                    "All JavaScript files in this folder will be loaded as CommonJS modules, to import custom user functions.",
                    desc.createEl("br"),
                    "The folder needs to be accessible from the vault.",
                    desc.createEl("br"),
                    "Check the ",
                    desc.createEl("a", {
                        href: "https://silentvoid13.github.io/Templater/",
                        // eslint-disable-next-line obsidianmd/ui/sentence-case -- Inline link text within a sentence, not a standalone UI label
                        text: "documentation",
                    }),
                    " for more information.",
                );
                return desc;
            })(),
            render: (setting) => {
                setting.addSearch((cb) => {
                    new FolderSuggest(this.app, cb.inputEl);
                    cb.setPlaceholder("Example: folder1/folder2")
                        .setValue(s.user_scripts_folder)
                        .onChange(async (new_folder) => {
                            s.user_scripts_folder = new_folder;
                            await this.plugin.save_settings();
                        });
                });
            },
        });

        // Intellisense dropdown
        items.push({
            name: "User script intellisense",
            desc: "Determine how you'd like to have user script intellisense render. Note values will not render if not in the script.",
            render: (setting) => {
                setting.addDropdown((cb) => {
                    cb.addOption("0", "Turn off intellisense")
                        .addOption(
                            "1",
                            "Render method description, parameters list, and return",
                        )
                        .addOption(
                            "2",
                            "Render method description and parameters list",
                        )
                        .addOption("3", "Render method description and return")
                        .addOption("4", "Render method description")
                        .setValue(s.intellisense_render.toString())
                        .onChange(async (value) => {
                            s.intellisense_render = parseInt(value);
                            await this.plugin.save_settings();
                        });
                });
            },
        });

        // Detected scripts (display-only)
        const scriptDesc = createFragment();
        let scriptName: string;
        if (!s.user_scripts_folder) {
            scriptName = "No user scripts folder set";
        } else {
            const files = errorWrapperSync(
                () => get_tfiles_from_folder(this.app, s.user_scripts_folder),
                `User scripts folder doesn't exist`,
            );
            if (!files || files.length === 0) {
                scriptName = "No user scripts detected";
            } else {
                let count = 0;
                for (const file of files) {
                    if (file.extension === "js") {
                        count++;
                        scriptDesc.append(
                            scriptDesc.createEl("li", {
                                text: `tp.user.${file.basename}`,
                            }),
                        );
                    }
                }
                scriptName = `Detected ${count} User Script(s)`;
            }
        }
        items.push({
            name: scriptName,
            desc: scriptDesc,
            render: (setting) => {
                setting.addExtraButton((extra) =>
                    extra
                        .setIcon("sync")
                        .setTooltip("Refresh")
                        .onClick(() => this.update()),
                );
            },
        });

        return items;
    }

    private systemCommandItems(): SettingGroupItem<keyof Settings>[] {
        const s = this.plugin.settings;
        const enableDesc = createFragment();
        enableDesc.append(
            "Allows you to create user functions linked to system commands.",
            enableDesc.createEl("br"),
            enableDesc.createEl("br"),
            enableDesc.createEl("b", { text: "Warning: ", cls: "mod-warning" }),
            "It can be dangerous to execute arbitrary system commands from untrusted sources. Only run system commands that you understand, from trusted sources.",
        );

        const shellDesc = createFragment();
        shellDesc.append(
            "Full path to the shell binary to execute the command with.",
            shellDesc.createEl("br"),
            "This setting is optional and will default to the system's default shell if not specified.",
            shellDesc.createEl("br"),
            "You can use forward slashes ('/') as path separators on all platforms if in doubt.",
        );

        return [
            {
                name: "Enable user system command functions",
                desc: enableDesc,
                render: (setting) => {
                    setting.addToggle((toggle) =>
                        toggle
                            .setValue(s.enable_system_commands)
                            .onChange(async (value) => {
                                s.enable_system_commands = value;
                                await this.plugin.save_settings();
                                this.update();
                            }),
                    );
                },
            },
            {
                name: "Timeout",
                desc: "Maximum timeout in seconds for a system command.",
                render: (setting) => {
                    setting.addText((text) =>
                        text
                            .setPlaceholder("Timeout")
                            .setValue(s.command_timeout.toString())
                            .onChange(async (new_value) => {
                                const new_timeout = Number(new_value);
                                if (isNaN(new_timeout)) {
                                    log_error(
                                        new TemplaterError(
                                            "Timeout must be a number",
                                        ),
                                    );
                                    return;
                                }
                                s.command_timeout = new_timeout;
                                await this.plugin.save_settings();
                            }),
                    );
                },
                visible: () => s.enable_system_commands,
            },
            {
                name: "Shell binary location",
                desc: shellDesc,
                control: {
                    type: "text",
                    key: "shell_path",
                    placeholder: "Example: /bin/bash, ...",
                },
                visible: () => s.enable_system_commands,
            },
            {
                type: "page",
                name: "User system command functions",
                items: [this.systemCommandPairsGroup()],
                visible: () => s.enable_system_commands,
            },
        ];
    }

    private systemCommandPairsGroup(): SettingDefinitionList<keyof Settings> {
        const s = this.plugin.settings;

        return {
            type: "list",
            heading: "User system command functions",
            addItem: {
                name: "Add new user function",
                action: () => {
                    s.templates_pairs.push(["", ""]);
                    this.update();
                    void this.plugin.save_settings();
                },
            },
            onDelete: (index) => {
                s.templates_pairs.splice(index, 1);
                this.update();
                void this.plugin.save_settings();
            },
            items: s.templates_pairs.map((template_pair, index) => ({
                name: template_pair[0] || `User function n°${index + 1}`,
                searchable: false,
                render: (setting: Setting) => {
                    setting.addText((text) => {
                        const t = text
                            .setPlaceholder("Function name")
                            .setValue(template_pair[0])
                            .onChange(async (new_value) => {
                                s.templates_pairs[index][0] = new_value;
                                await this.plugin.save_settings();
                            });
                        return t;
                    });
                    setting.addTextArea((text) => {
                        const t = text
                            .setPlaceholder("System command")
                            .setValue(template_pair[1])
                            .onChange(async (new_cmd) => {
                                s.templates_pairs[index][1] = new_cmd;
                                await this.plugin.save_settings();
                            });
                        t.inputEl.setAttr("rows", 2);
                        return t;
                    });
                },
            })),
        };
    }
}
