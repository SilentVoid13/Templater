import TemplaterPlugin from "main";
import { RunningConfig } from "core/Templater";
import { IGenerateObject } from "../IGenerateObject";
import { UserSystemFunctions } from "./UserSystemFunctions";
import { UserScriptFunctions } from "./UserScriptFunctions";

export class UserFunctions implements IGenerateObject {
    private user_system_functions: UserSystemFunctions;
    private user_script_functions: UserScriptFunctions;

    constructor(private plugin: TemplaterPlugin) {
        this.user_system_functions = new UserSystemFunctions(plugin);
        this.user_script_functions = new UserScriptFunctions(plugin);
    }

    async generate_object(
        config: RunningConfig
    ): Promise<Record<string, unknown>> {
        let user_system_functions = {};
        let user_script_functions = {};

        if (this.plugin.settings.enable_system_commands) {
            user_system_functions =
                await this.user_system_functions.generate_object(config);
        }

        // user_scripts_folder needs to be explicitly set to '/' to query from root
        if (this.plugin.settings.user_scripts_folder) {
            user_script_functions =
                await this.user_script_functions.generate_object();
        }

        return {
            ...user_system_functions,
            ...user_script_functions,
        };
    }
}
