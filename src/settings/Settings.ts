import TemplaterPlugin from "main";
import {
    Setting,
    type SettingDefinitionItem,
    type SettingDefinitionList,
    type SettingGroupItem,
    PluginSettingTab,
    TFile,
} from "obsidian";
import { errorWrapperSync } from "utils/Error";
import { arraymove, get_tfiles_from_folder } from "utils/Utils";
import { FileSuggest, FileSuggestMode } from "./suggesters/FileSuggester";
import { FolderSuggest } from "./suggesters/FolderSuggester";
import { ConfirmDangerousSettingModal } from "./modals/ConfirmDangerousSettingModal";
import { IgnoreFolderModal } from "./modals/IgnoreFolderModal";
import { StartupTemplateModal } from "./modals/StartupTemplateModal";
import { SystemCommandModal } from "./modals/SystemCommandModal";
import { IntellisenseRenderOption } from "./RenderSettings/IntellisenseRenderOption";
import {
    DEFAULT_LOCAL_SETTINGS,
    type LocalSettings,
    getLocalSettings,
    saveLocalSetting,
} from "./LocalSettings";
import { set } from "utils/set";
import { get, type Paths } from "utils/get";
import { UserScriptsPage } from "./UserScriptsPage";

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
    templates_pairs: [],
    trigger_on_file_creation_mode: "none",
    auto_jump_to_cursor: false,
    shell_path: "",
    user_scripts_folder: "",
    folder_templates: [],
    file_templates: [],
    syntax_highlighting: true,
    syntax_highlighting_mobile: false,
    enabled_templates_hotkeys: [],
    startup_templates: [],
    intellisense_render:
        IntellisenseRenderOption.RenderDescriptionParameterReturn,
    ignore_folders_on_creation: [],
};

export interface Settings {
    templates_folder: string;
    syntax_highlighting: boolean;
    syntax_highlighting_mobile: boolean;
    auto_jump_to_cursor: boolean;
    trigger_on_file_creation_mode: "none" | "folder" | "regex";
    folder_templates: Array<FolderTemplate>;
    file_templates: Array<FileTemplate>;
    ignore_folders_on_creation: Array<IgnoreFolderOnCreation>;
    command_timeout: number;
    templates_pairs: Array<[string, string]>;
    shell_path: string;
    user_scripts_folder: string;
    enabled_templates_hotkeys: Array<string>;
    startup_templates: Array<string>;
    intellisense_render: IntellisenseRenderOption;
}

export class TemplaterSettingTab extends PluginSettingTab {
    icon = "templater-icon";

    constructor(private plugin: TemplaterPlugin) {
        super(plugin.app, plugin);
        // Obsidian's page-row handler intercepts clicks in the capture phase,
        // so onclick/addEventListener on the <a> itself never fires.
        // Adding a capture listener here (on the ancestor) fires first and lets
        // external links open without triggering sub-page navigation.
        this.containerEl.addEventListener(
            "click",
            (e) => {
                if (
                    e.target &&
                    "href" in e.target &&
                    e.target.href &&
                    typeof e.target.href === "string"
                ) {
                    e.stopPropagation();
                }
            },
            true,
        );
        // Some settings require files/folders to be loaded to properly render.
        if (!this.app.workspace.layoutReady) {
            this.app.workspace.onLayoutReady(() => {
                this.update();
            });
        }
    }

    private isLocalSettingsKey(key: string): key is keyof LocalSettings {
        return key in DEFAULT_LOCAL_SETTINGS;
    }

    // Overriding `getControlValue` to support dot notation keys for nested settings
    getControlValue(key: Paths<Settings> | keyof LocalSettings): unknown {
        if (this.isLocalSettingsKey(key)) {
            return getLocalSettings(this.plugin.app)[key];
        }
        return get(this.plugin.settings, key);
    }

    // Overriding `setControlValue` to trigger UI changes on save,
    // and to support dot notation keys for nested settings
    async setControlValue(
        key: keyof Settings | keyof LocalSettings,
        value: unknown,
    ) {
        const dangerousConfig: Partial<
            Record<keyof LocalSettings, { title: string; warning: string }>
        > = {
            enable_startup_templates: {
                title: "Enable startup templates",
                warning:
                    "This can be dangerous if you set a startup template with unknown/unsafe content. Make sure that every startup template's content is safe.",
            },
            trigger_on_file_creation: {
                title: "Trigger Templater on new file creation",
                warning:
                    "This can be dangerous if you create new files with unknown / unsafe content on creation. Make sure that every new file's content is safe on creation.",
            },
            enable_system_commands: {
                title: "Enable user system command functions",
                warning:
                    "It can be dangerous to execute arbitrary system commands from untrusted sources. Only run system commands that you understand, from trusted sources.",
            },
        };

        if (
            this.isLocalSettingsKey(key) &&
            value === true &&
            key in dangerousConfig
        ) {
            const config = dangerousConfig[key]!;
            new ConfirmDangerousSettingModal(
                this.app,
                config.title,
                config.warning,
                async () => {
                    await this.commitControlValue(key, value);
                },
            ).open();
            this.update();
            return;
        }

        await this.commitControlValue(key, value);
    }

    private async commitControlValue(
        key: keyof Settings | keyof LocalSettings,
        value: unknown,
    ) {
        if (this.isLocalSettingsKey(key)) {
            saveLocalSetting(
                this.plugin.app,
                key,
                value as LocalSettings[typeof key],
            );
        } else {
            set(this.plugin.settings, key as Paths<Settings>, value);
        }
        const rerenderKeys = [
            "trigger_on_file_creation",
            "trigger_on_file_creation_mode",
            "enable_startup_templates",
            "enable_system_commands",
        ];
        if (rerenderKeys.contains(key)) {
            this.update();
        }
        await this.plugin.save_settings();
    }

    getSettingDefinitions(): SettingDefinitionItem<
        keyof Settings | keyof LocalSettings
    >[] {
        const items: SettingDefinitionItem<
            keyof Settings | keyof LocalSettings
        >[] = [];
        const localSettings = getLocalSettings(this.plugin.app);

        items.push({
            type: "group",
            items: [
                {
                    name: "Internal variables and functions",
                    desc: (() => {
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
                        return internalFunctionsDesc;
                    })(),
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
                    desc: (() => {
                        const templateHotkeysDesc = createFragment();
                        templateHotkeysDesc.append(
                            "Bind templates to ",
                            templateHotkeysDesc.createEl("a", {
                                href: "https://obsidian.md/help/plugins/command-palette",
                                // eslint-disable-next-line obsidianmd/ui/sentence-case -- Inline link text within a sentence, not a standalone UI label
                                text: "commands",
                            }),
                            ". Bind commands to ",
                            templateHotkeysDesc.createEl("a", {
                                href: "https://obsidian.md/help/hotkeys",
                                // eslint-disable-next-line obsidianmd/ui/sentence-case
                                text: "hotkeys",
                            }),
                            ' in "Hotkeys" settings.',
                        );
                        return templateHotkeysDesc;
                    })(),
                    items: this.templateHotkeysGroup(),
                },
                {
                    name: "Automatic jump to cursor",
                    desc: (() => {
                        const autoJumpDesc = createFragment();
                        autoJumpDesc.append(
                            "Automatically triggers ",
                            autoJumpDesc.createEl("code", {
                                // eslint-disable-next-line obsidianmd/ui/sentence-case -- Inline code identifier, not a UI label
                                text: "tp.file.cursor",
                            }),
                            " after inserting a template.",
                            autoJumpDesc.createEl("br"),
                            "You can also set a hotkey to manually trigger ",
                            autoJumpDesc.createEl("code", {
                                // eslint-disable-next-line obsidianmd/ui/sentence-case -- Inline code identifier, not a UI label
                                text: "tp.file.cursor",
                            }),
                            ".",
                        );
                        return autoJumpDesc;
                    })(),
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
            items: this.fileCreationGroup(localSettings),
        });

        items.push({
            type: "group",
            heading: "Startup templates",
            items: [
                {
                    name: "Enable startup templates",
                    desc: "Enables templates to run automatically when Templater starts.",
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
                    visible: () => localSettings.enable_startup_templates,
                },
            ],
        });

        items.push({
            type: "group",
            heading: "User scripts",
            items: this.userScriptItems(),
        });

        items.push({
            type: "group",
            heading: "User system commands",
            items: this.systemCommandItems(localSettings),
        });

        return items;
    }

    private fileCreationGroup(
        localSettings: LocalSettings,
    ): SettingGroupItem<keyof Settings | keyof LocalSettings>[] {
        const triggerDesc = createFragment();
        triggerDesc.append(
            "Templater will listen for the new file creation event, and, if it matches a rule you've set, replace every command it finds in the new file's content. ",
            "This makes Templater compatible with other plugins like the Daily note core plugin, Calendar plugin, Review plugin, Note refactor plugin, etc. ",
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
                name: "Excluded folders",
                desc: "New files created in these folders will never trigger Templater.",
                items: [this.ignoreFoldersGroup()],
                visible: () => localSettings.trigger_on_file_creation,
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
                visible: () => localSettings.trigger_on_file_creation,
            },
            {
                type: "page",
                name: "Folder templates",
                desc: folderTriggerDesc,
                items: [this.folderTemplatesGroup()],
                visible: () =>
                    localSettings.trigger_on_file_creation &&
                    this.plugin.settings.trigger_on_file_creation_mode ===
                        "folder",
            },
            {
                type: "page",
                name: "File regex templates",
                desc: fileRegexTriggerDesc,
                items: [this.fileTemplatesGroup()],
                visible: () =>
                    localSettings.trigger_on_file_creation &&
                    this.plugin.settings.trigger_on_file_creation_mode ===
                        "regex",
            },
        ];
    }

    private ignoreFoldersGroup(): SettingDefinitionList<keyof Settings> {
        return {
            type: "list",
            addItem: {
                name: "Add folder",
                action: () => {
                    new IgnoreFolderModal(this.app, (folder) => {
                        this.plugin.settings.ignore_folders_on_creation.push({
                            folder,
                        });
                        this.update();
                        void this.plugin.save_settings();
                    }).open();
                },
            },
            onDelete: (index) => {
                this.plugin.settings.ignore_folders_on_creation.splice(
                    index,
                    1,
                );
                this.update();
                void this.plugin.save_settings();
            },
            emptyState: "No exclusions added.",
            items: this.plugin.settings.ignore_folders_on_creation.map(
                (entry) => ({
                    name: entry.folder,
                    searchable: false,
                }),
            ),
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
                        setting.setClass("templater-settings-hide-info");
                        setting.addText((cb) => {
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
                                        setting.setErrorMessage(
                                            "This folder already has a template associated with it",
                                        );
                                        return;
                                    }
                                    setting.setErrorMessage("");
                                    this.plugin.settings.folder_templates[
                                        index
                                    ].folder = new_folder;
                                    await this.plugin.save_settings();
                                });
                        });
                        setting.addText((cb) => {
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
        return {
            type: "list",
            addItem: {
                name: "Add file regex template",
                action: () => {
                    this.plugin.settings.file_templates.push({
                        regex: "",
                        template: "",
                    });
                    this.update();
                    void this.plugin.save_settings();
                },
            },
            onReorder: (oldIndex, newIndex) => {
                arraymove(
                    this.plugin.settings.file_templates,
                    oldIndex,
                    newIndex,
                );
                this.update();
                void this.plugin.save_settings();
            },
            onDelete: (index) => {
                this.plugin.settings.file_templates.splice(index, 1);
                this.update();
                void this.plugin.save_settings();
            },
            items: this.plugin.settings.file_templates.map(
                (file_template, index) => ({
                    name: "File regex template",
                    searchable: false,
                    render: (setting: Setting) => {
                        setting.setClass("templater-settings-hide-info");
                        setting.addText((cb) => {
                            cb.setPlaceholder("File regex")
                                .setValue(file_template.regex)
                                .onChange(async (new_regex) => {
                                    this.plugin.settings.file_templates[
                                        index
                                    ].regex = new_regex;
                                    await this.plugin.save_settings();
                                });
                        });
                        setting.addText((cb) => {
                            new FileSuggest(
                                cb.inputEl,
                                this.plugin,
                                FileSuggestMode.TemplateFiles,
                            );
                            cb.setPlaceholder("Template")
                                .setValue(file_template.template)
                                .onChange(async (new_template) => {
                                    this.plugin.settings.file_templates[
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

    private templateHotkeysGroup(): SettingDefinitionList<keyof Settings>[] {
        if (!this.app.workspace.layoutReady) {
            return [];
        }
        const allTemplates = errorWrapperSync(
            () =>
                get_tfiles_from_folder(
                    this.app,
                    this.plugin.settings.templates_folder,
                ),
            "Templates folder doesn't exist",
        );
        const mappedTemplates: TFile[] = [];
        const unmappedTemplates: TFile[] = [];

        if (Array.isArray(allTemplates)) {
            allTemplates.forEach((file) => {
                if (
                    this.plugin.settings.enabled_templates_hotkeys.includes(
                        file.path,
                    )
                ) {
                    mappedTemplates.push(file);
                } else {
                    unmappedTemplates.push(file);
                }
            });
        }

        const items: SettingDefinitionList<keyof Settings>[] = [];

        if (mappedTemplates.length > 0) {
            items.push({
                type: "list",
                heading: "Bound templates",
                onDelete: (index) => {
                    this.plugin.command_handler.remove_template_hotkey(
                        this.plugin.settings.enabled_templates_hotkeys[index],
                    );
                    this.plugin.settings.enabled_templates_hotkeys.splice(
                        index,
                        1,
                    );
                    this.update();
                    void this.plugin.save_settings();
                },
                items: mappedTemplates.map((template, index) => ({
                    name: template.path,
                    searchable: false,
                })),
            });
        }

        if (unmappedTemplates.length > 0) {
            items.push({
                type: "list",
                heading: "Unbound templates",
                items: unmappedTemplates.map((template) => ({
                    name: template.path,
                    searchable: false,
                    action: () => {
                        this.plugin.command_handler.add_template_hotkey(
                            null,
                            template.path,
                        );
                        this.plugin.settings.enabled_templates_hotkeys.push(
                            template.path,
                        );
                        this.update();
                        void this.plugin.save_settings();
                    },
                })),
            });
        }

        return items;
    }

    private startupTemplatesGroup(): SettingDefinitionList<keyof Settings> {
        return {
            type: "list",
            addItem: {
                name: "Add new startup template",
                action: () => {
                    new StartupTemplateModal(
                        this.app,
                        this.plugin,
                        (template) => {
                            this.plugin.settings.startup_templates.push(
                                template,
                            );
                            this.update();
                            void this.plugin.save_settings();
                        },
                    ).open();
                },
            },
            onDelete: (index) => {
                this.plugin.settings.startup_templates.splice(index, 1);
                this.update();
                void this.plugin.save_settings();
            },
            emptyState: "No startup templates added.",
            items: this.plugin.settings.startup_templates.map((template) => ({
                name: template,
                searchable: false,
            })),
        };
    }

    private userScriptItems(): SettingGroupItem<keyof Settings>[] {
        const items: SettingGroupItem<keyof Settings>[] = [];
        items.push({
            name: "User scripts folder",
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
            control: {
                type: "folder",
                key: "user_scripts_folder",
            },
        });

        items.push({
            name: "User script intellisense",
            desc: "Determine how you'd like to have user script intellisense render. Note values will not render if not in the script.",
            control: {
                type: "dropdown",
                key: "intellisense_render",
                options: {
                    0: "Turn off intellisense",
                    1: "Render method description, parameters list, and return",
                    2: "Render method description and parameters list",
                    3: "Render method description and return",
                    4: "Render method description",
                },
            },
        });

        let scriptDesc: string;
        if (!this.plugin.settings.user_scripts_folder) {
            scriptDesc = "No user scripts folder set";
        } else if (!this.app.workspace.layoutReady) {
            scriptDesc = "Loading...";
        } else {
            const files = errorWrapperSync(
                () =>
                    get_tfiles_from_folder(
                        this.app,
                        this.plugin.settings.user_scripts_folder,
                    ),
                `User scripts folder doesn't exist`,
            );
            let count = 0;
            if (Array.isArray(files)) {
                count = files.reduce((acc, file) => {
                    if (file.extension === "js") {
                        return acc + 1;
                    }
                    return acc;
                }, 0);
            }
            scriptDesc = `Detected ${count} user script${count !== 1 ? "s" : ""}`;
        }
        items.push({
            type: "page",
            name: "User scripts",
            searchable: false,
            desc: scriptDesc,
            page: () => new UserScriptsPage(this, this.plugin),
        });

        return items;
    }

    private systemCommandItems(
        localSettings: LocalSettings,
    ): SettingGroupItem<keyof Settings | keyof LocalSettings>[] {
        const shellDesc = createFragment();
        shellDesc.append(
            "Full path to the shell binary to execute the command with.",
            shellDesc.createEl("br"),
            "This setting is optional and will default to the system's default shell if not specified.",
            shellDesc.createEl("br"),
            "You can use forward slashes (",
            shellDesc.createEl("code", { text: "/" }),
            ") as path separators on all platforms if in doubt.",
        );

        return [
            {
                name: "Enable user system command functions",
                desc: "Allows you to create user functions linked to system commands.",
                control: {
                    type: "toggle",
                    key: "enable_system_commands",
                },
            },
            {
                name: "Timeout",
                desc: "Maximum timeout in seconds for a system command.",
                control: {
                    type: "number",
                    key: "command_timeout",
                    validate: (value) => {
                        if (isNaN(value) || value <= 0) {
                            return "Timeout must be a positive number";
                        }
                        return undefined;
                    },
                },
                visible: () => localSettings.enable_system_commands,
            },
            {
                name: "Shell binary location",
                desc: shellDesc,
                control: {
                    type: "text",
                    key: "shell_path",
                    placeholder: "/bin/bash",
                },
                visible: () => localSettings.enable_system_commands,
            },
            {
                type: "page",
                name: "User system command functions",
                items: [this.systemCommandPairsGroup()],
                visible: () => localSettings.enable_system_commands,
            },
        ];
    }

    private systemCommandPairsGroup(): SettingDefinitionList<keyof Settings> {
        const openModal = (
            initialValues: { name: string; command: string },
            onSubmit: (name: string, command: string) => Promise<void> | void,
            excludeIndex?: number,
        ) => {
            new SystemCommandModal(
                this.app,
                initialValues,
                onSubmit,
                (name) => {
                    if (
                        this.plugin.settings.templates_pairs.some(
                            (p, i) => p[0] === name && i !== excludeIndex,
                        )
                    ) {
                        return "This function name is already in use";
                    }
                    return undefined;
                },
            ).open();
        };

        return {
            type: "list",
            emptyState: "No user functions added.",
            addItem: {
                name: "Add new user function",
                action: () => {
                    openModal({ name: "", command: "" }, (name, command) => {
                        this.plugin.settings.templates_pairs.push([
                            name,
                            command,
                        ]);
                        this.update();
                        void this.plugin.save_settings();
                    });
                },
            },
            onDelete: (index) => {
                this.plugin.settings.templates_pairs.splice(index, 1);
                this.update();
                void this.plugin.save_settings();
            },
            items: this.plugin.settings.templates_pairs.map(
                (template_pair, index) => ({
                    name: template_pair[0],
                    desc: template_pair[1] || undefined,
                    searchable: false,
                    action: () => {
                        openModal(
                            {
                                name: template_pair[0],
                                command: template_pair[1],
                            },
                            async (name, command) => {
                                this.plugin.settings.templates_pairs[index][0] =
                                    name;
                                this.plugin.settings.templates_pairs[index][1] =
                                    command;
                                this.update();
                                await this.plugin.save_settings();
                            },
                            index,
                        );
                    },
                }),
            ),
        };
    }
}
