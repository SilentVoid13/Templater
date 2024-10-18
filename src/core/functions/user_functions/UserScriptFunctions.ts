import { TFile } from "obsidian";

import TemplaterPlugin from "main";
import { IGenerateObject } from "../IGenerateObject";
import { get_tfiles_from_folder } from "utils/Utils";
import { errorWrapperSync, TemplaterError } from "utils/Error";

export class UserScriptFunctions implements IGenerateObject {
    constructor(private plugin: TemplaterPlugin) {}

    async generate_user_script_functions(): Promise<
        Map<string, () => unknown>
    > {
        const user_script_functions: Map<string, () => unknown> = new Map();
        const files = errorWrapperSync(
            () =>
                get_tfiles_from_folder(
                    this.plugin.app,
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
        user_script_functions: Map<string, () => unknown>
    ): Promise<void> {
        const req = (s: string) => {
            return window.require && window.require(s);
        };
        const exp: Record<string, unknown> = {};
        const mod = {
            exports: exp,
        };

        const file_content = await this.plugin.app.vault.read(file);
        try {
            const wrapping_fn = window.eval(
                "(function anonymous(require, module, exports){" +
                    file_content +
                    "\n})"
            );
            wrapping_fn(req, mod, exp);
        } catch (err) {
            throw new TemplaterError(
                `Failed to load user script at "${file.path}".`,
                err.message
            );
        }
        const user_function = exp["default"] || mod.exports;

        if (!user_function) {
            throw new TemplaterError(
                `Failed to load user script at "${file.path}". No exports detected.`
            );
        }
        if (!(user_function instanceof Function)) {
            throw new TemplaterError(
                `Failed to load user script at "${file.path}". Default export is not a function.`
            );
        }
        user_script_functions.set(
            `${file.basename}`,
            user_function as () => unknown
        );
    }

    async generate_object(): Promise<Record<string, unknown>> {
        const user_script_functions =
            await this.generate_user_script_functions();
        return Object.fromEntries(user_script_functions);
    }
}
