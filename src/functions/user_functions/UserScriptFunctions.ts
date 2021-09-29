import { App, FileSystemAdapter, TFile } from "obsidian";

import TemplaterPlugin from "main";
import { IGenerateObject } from "functions/IGenerateObject";
import { RunningConfig } from "Templater";
import { get_tfiles_from_folder } from "Utils";
import { errorWrapperSync, TemplaterError } from "Error";

export class UserScriptFunctions implements IGenerateObject {
    constructor(private app: App, private plugin: TemplaterPlugin) {}

    async generate_user_script_functions(
        config: RunningConfig
    ): Promise<Map<string, Function>> {
        const user_script_functions: Map<string, Function> = new Map();
        const files = errorWrapperSync(
            () =>
                get_tfiles_from_folder(
                    this.app,
                    this.plugin.settings.user_scripts_folder
                ),
            `Couldn't find user script folder "${this.plugin.settings.user_scripts_folder}"`
        );
        if (!files) {
            return new Map();
        }

        for (const file of files) {
            if (file.extension.toLowerCase() === "js") {
                await this.load_user_script_function(
                    config,
                    file,
                    user_script_functions
                );
            }
        }
        return user_script_functions;
    }

    async load_user_script_function(
        config: RunningConfig,
        file: TFile,
        user_script_functions: Map<string, Function>
    ): Promise<void> {
        if (!(this.app.vault.adapter instanceof FileSystemAdapter)) {
            throw new TemplaterError(
                "app.vault is not a FileSystemAdapter instance"
            );
        }
        const vault_path = this.app.vault.adapter.getBasePath();
        const file_path = `${vault_path}/${file.path}`;

        // https://stackoverflow.com/questions/26633901/reload-module-at-runtime
        // https://stackoverflow.com/questions/1972242/how-to-auto-reload-files-in-node-js
        if (Object.keys(window.require.cache).contains(file_path)) {
            delete window.require.cache[window.require.resolve(file_path)];
        }

        const user_function = await import(file_path);
        if (!user_function.default) {
            throw new TemplaterError(
                `Failed to load user script ${file_path}. No exports detected.`
            );
        }
        if (!(user_function.default instanceof Function)) {
            throw new TemplaterError(
                `Failed to load user script ${file_path}. Default export is not a function.`
            );
        }
        user_script_functions.set(`${file.basename}`, user_function.default);
    }

    async generate_object(
        config: RunningConfig
    ): Promise<Record<string, unknown>> {
        const user_script_functions = await this.generate_user_script_functions(
            config
        );
        return Object.fromEntries(user_script_functions);
    }
}
