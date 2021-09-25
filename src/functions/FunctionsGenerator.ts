import { App } from "obsidian";

import { InternalFunctions } from "functions/internal_functions/InternalFunctions";
import { UserFunctions } from 'functions/user_functions/UserFunctions';
import TemplaterPlugin from "main";
import { IGenerateObject } from 'functions/IGenerateObject';
import { obsidian_module } from "Utils";
import { RunningConfig } from "Templater";

export enum FunctionsMode {
    INTERNAL,
    USER_INTERNAL,
};

export class FunctionsGenerator implements IGenerateObject {
    public internal_functions: InternalFunctions;
	public user_functions: UserFunctions;
    public current_object: {};

    constructor(private app: App, private plugin: TemplaterPlugin) {
        this.internal_functions = new InternalFunctions(this.app, this.plugin);
        this.user_functions = new UserFunctions(this.app, this.plugin);
    }

    async init(): Promise<void> {
        await this.internal_functions.init();
    }

    async set_current_object(config: RunningConfig, functions_mode: FunctionsMode): Promise<void> {
        this.current_object = await this.generate_object(config, functions_mode);
    }

    additional_functions(): {} {
        return {
            obsidian: obsidian_module,
        };
    }

    async generate_object(config: RunningConfig, functions_mode: FunctionsMode = FunctionsMode.USER_INTERNAL): Promise<{}> {
        const final_object = {};
        const additional_functions_object = this.additional_functions();
        const internal_functions_object = await this.internal_functions.generate_object(config);
        let user_functions_object = {};

        if (!this.current_object) {
            // If a user system command is using tp.file.include, we need the current_object to be set.
            this.current_object = internal_functions_object;
        }

        Object.assign(final_object, additional_functions_object);
        switch (functions_mode) {
            case FunctionsMode.INTERNAL:
                Object.assign(final_object, internal_functions_object);
                break;
            case FunctionsMode.USER_INTERNAL:
                user_functions_object = await this.user_functions.generate_object(config);
                Object.assign(final_object, {
                    ...internal_functions_object,
                    user: user_functions_object,
                });
                break;
        }

        return final_object;
    }
}
