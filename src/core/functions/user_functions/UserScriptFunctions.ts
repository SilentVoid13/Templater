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
        const exported = exp["default"] ?? mod.exports;

        if (!exported) {
            throw new TemplaterError(
                `Failed to load user script at "${file.path}". No exports detected.`
            );
        }

        if (typeof exported === "function") {
            // ✅ Case 1: The export is a single function
            user_script_functions.set(file.basename, exported);
        }
        else if (typeof exported === "object" && exported !== null) {
            // ✅ Case 2: The export is an object, check if all values are functions
            const allValuesAreFunctions = Object.values(exported).every(
                (v) => typeof v === "function"
            );

            if (!allValuesAreFunctions) {
                // ❌ Error: The exported object contains non-function values
                throw new TemplaterError(
                    `Exported object in "${file.path}" must contain only functions.`
                );
            }

            // ✅ Case 2-1: The export is an object and all values are functions
            user_script_functions.set(file.basename, exported);
        }
        // ❌ Error: The export is neither a function nor an object of functions
        else {
            throw new TemplaterError(
                `Invalid export in "${file.path}". Must be a function or object of functions.`
            );
        }

    }

    async generate_object(): Promise<Record<string, unknown>> {
        const user_script_functions =
            await this.generate_user_script_functions();
        return Object.fromEntries(user_script_functions);
    }
}
