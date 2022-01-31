import { App, TFile } from "obsidian";

import TemplaterPlugin from "main";
import { IGenerateObject } from "../IGenerateObject";
import { RunningConfig } from "core/Templater";
import { get_tfiles_from_folder } from "utils/Utils";
import { errorWrapperSync, TemplaterError } from "utils/Error";

export class UserScriptFunctions implements IGenerateObject {
    constructor(private app: App, private plugin: TemplaterPlugin) {}

    async generate_user_script_functions(
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
            exports: exp
        };

        let file_content = await this.app.vault.read(file);
        let wrapping_fn;
        const requires = file_content.match(/require\('\.\/(.*)'\)/g)?.map(
            (r) => {
                r = r.replace(/require\('\.\/(.*)'\)/, "$1")
                if (r.includes(".js")) {
                    return r.split(".")[0]
                }
                return r;
            }
        );
        if (requires) {
        const functions = await requires.reduce(async (acc, r) => {
            const path = this.plugin.settings.user_scripts_folder + "/" + r + ".js";
            const file = this.app.vault.getAbstractFileByPath(path);
            if (file) {
                acc[r] = await this.app.vault.read(file);
            }
            return acc;
        }, {})
        requires.forEach((r, i) => {
            const script = functions[r]
            if (script) {
                file_content = file_content.replace(`${r}.js`, r)
                file_content = file_content.replace(`require('./${r}')`, script);
            }
        })
        wrapping_fn = window.eval("(function anonymous(require, module, exports){" + file_content + "\n})");
        } else {
            wrapping_fn = window.eval("(function anonymous(require, module, exports){" + file_content + "\n})");
        }
        wrapping_fn(req, mod, exp);
        const user_function = exp['default'] || mod.exports;

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
        const user_script_functions = await this.generate_user_script_functions();
        return Object.fromEntries(user_script_functions);
    }
}
