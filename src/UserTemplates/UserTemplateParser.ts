import { App, FileSystemAdapter, TFile } from "obsidian";
import { exec } from "child_process";
import { promisify } from "util";

import TemplaterPlugin from "main";
import { ContextMode } from "TemplateParser";
import { TParser } from "TParser";
import { UNSUPPORTED_MOBILE_TEMPLATE } from "Constants";
import { RunningConfig } from "Templater";
import { getTFilesFromFolder } from "Utils";
import { TemplaterError } from "Error";

export class UserTemplateParser implements TParser {
    private cwd: string;
    private exec_promise: Function;
    private user_system_command_functions: Map<string, Function> = new Map();
    private user_script_functions: Map<string, Function> = new Map();

    constructor(private app: App, private plugin: TemplaterPlugin) {
        this.setup();        
    }

    setup(): void {
        // @ts-ignore
        if (this.app.isMobile || !(this.app.vault.adapter instanceof FileSystemAdapter)) {
            this.cwd = "";
        }
        else {
            this.cwd = this.app.vault.adapter.getBasePath();
            this.exec_promise = promisify(exec);
        }
    }

    async init(): Promise<void> {}

    async generate_user_script_functions(config: RunningConfig): Promise<void> {
        let files = getTFilesFromFolder(this.app, this.plugin.settings.script_folder);

        for (let file of files) {
            if (file.extension.toLowerCase() === "js") {
                await this.load_user_script_function(config, file);
            }
        }
    }

    async load_user_script_function(config: RunningConfig, file: TFile): Promise<void> {
        if (!(this.app.vault.adapter instanceof FileSystemAdapter)) {
            throw new TemplaterError("app.vault is not a FileSystemAdapter instance");
        }
        let vault_path = this.app.vault.adapter.getBasePath();
        let file_path = `${vault_path}/${file.path}`;

        // https://stackoverflow.com/questions/26633901/reload-module-at-runtime
        // https://stackoverflow.com/questions/1972242/how-to-auto-reload-files-in-node-js
        if (Object.keys(window.require.cache).contains(file_path)) {
            delete window.require.cache[window.require.resolve(file_path)];
        }

        const user_function = await import(file_path);
        if (!user_function.default) {
            throw new TemplaterError(`Failed to load user script ${file_path}. No exports detected.`);
        }
        if (!(user_function.default instanceof Function)) {
            throw new TemplaterError(`Failed to load user script ${file_path}. Default export is not a function.`);
        }
        this.user_script_functions.set(`${file.basename}`, user_function.default);
    }

    // TODO: Add mobile support
    async generate_system_command_user_functions(config: RunningConfig): Promise<void> {
        const context = await this.plugin.templater.parser.generateContext(config, ContextMode.INTERNAL);

        for (let [template, cmd] of this.plugin.settings.templates_pairs) {
            if (template === "" || cmd === "") {
                continue;
            }

            // @ts-ignore
            if (this.app.isMobile) {
                this.user_system_command_functions.set(template, (user_args?: any): string => {
                    return UNSUPPORTED_MOBILE_TEMPLATE;
                })
            }
            else {
                cmd = await this.plugin.templater.parser.parseTemplates(cmd, context);

                this.user_system_command_functions.set(template, async (user_args?: any): Promise<string> => {
                    const process_env = {
                        ...process.env,
                        ...user_args,
                    };

                    const cmd_options = {
                        timeout: this.plugin.settings.command_timeout * 1000,
                        cwd: this.cwd,
                        env: process_env,
                        ...(this.plugin.settings.shell_path !== "" && {shell: this.plugin.settings.shell_path}),
                    };

                    try {
                        const {stdout} = await this.exec_promise(cmd, cmd_options);
                        return stdout.trimRight();
                    }
                    catch(error) {
                        throw new TemplaterError(`Error with User Template ${template}`, error);
                    }
                });
            }
        }
    }

    async generateContext(config: RunningConfig): Promise<{}> {
        this.user_system_command_functions.clear();
        this.user_script_functions.clear();

        if (this.plugin.settings.enable_system_commands) {
            await this.generate_system_command_user_functions(config);
        }
        // TODO: Add mobile support
        // @ts-ignore
        if (!this.app.isMobile && this.plugin.settings.script_folder) {
            await this.generate_user_script_functions(config);
        }

        return {
            ...Object.fromEntries(this.user_system_command_functions),
            ...Object.fromEntries(this.user_script_functions),
        };
    }
}