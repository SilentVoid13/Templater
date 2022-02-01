import { App, TFile } from "obsidian";

import TemplaterPlugin from "main";
import { IGenerateObject } from "../IGenerateObject";
import { RunningConfig } from "core/Templater";
import { get_tfiles_from_folder } from "utils/Utils";
import { errorWrapperSync, TemplaterError } from "utils/Error";

export class UserScriptFunctions implements IGenerateObject {
    constructor(private app: App, private plugin: TemplaterPlugin) {}

    async generate_user_script_functions(): Promise<Map<string, Function>> {
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
                    file,
                    user_script_functions
                );
            }
        }
        return user_script_functions;
    }

    async load_user_script_function(
        file: TFile,
        user_script_functions: Map<string, Function>
    ): Promise<void> {
        let req = (s: string) => {
            return window.require && window.require(s);
        };
        let exp: Record<string, unknown> = {};
        let mod = {
            exports: exp,
        };

        let file_content = await this.app.vault.read(file);
        file_content = await this.inline_requires(file_content);
        const wrapping_fn = window.eval(
            "(function anonymous(require, module, exports){" +
                file_content +
                "\n})"
        );
        wrapping_fn(req, mod, exp);
        const user_function = exp["default"] || mod.exports;

        if (!user_function) {
            throw new TemplaterError(
                `Failed to load user script ${file.path}. No exports detected.`
            );
        }
        if (!(user_function instanceof Function)) {
            throw new TemplaterError(
                `Failed to load user script ${file.path}. Default export is not a function.`
            );
        }
        user_script_functions.set(`${file.basename}`, user_function);
    }

    async generate_object(): Promise<Record<string, unknown>> {
        const user_script_functions =
            await this.generate_user_script_functions();
        return Object.fromEntries(user_script_functions);
    }

    async inline_requires(file_content: string): Promise<string> {
        const require = file_content.match(/require\('\.\/(.*)(\.js)?'\)/);
        if (!require) {
            return file_content;
        }
        if (require && require[1]) {
            const require_path = `${this.plugin.settings.user_scripts_folder}/${require[1]}.js`;
            const require_file =
                this.app.vault.getAbstractFileByPath(require_path);
            let require_content = await this.app.vault.read(require_file as TFile);
            require_content = require_content.replace(
                /module\.exports = .*$/,
                ""
            );
            const exists = file_content.includes(require_content);
            let inlined = file_content;
            if (!exists) {
                inlined = file_content.replace(
                    `const ${require[1]} = ${require[0]}`,
                    require_content
                );
            } else {
                inlined = file_content.replace(`const ${require[1]} = ${require[0]}`, "");
            }
            return this.inline_requires(inlined);
        }
    }
}
