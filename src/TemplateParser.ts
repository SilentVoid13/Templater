import { App, TFile } from "obsidian";
import * as Eta from "eta";

import { InternalTemplateParser } from "./InternalTemplates/InternalTemplateParser";
import TemplaterPlugin from "./main";
import { UserTemplateParser } from "./UserTemplates/UserTemplateParser";
import { TParser } from "TParser";
import { obsidian_module } from "Utils";
import { RunningConfig } from "Templater";

export enum ContextMode {
    INTERNAL,
    USER_INTERNAL,
    DYNAMIC,
};

export class TemplateParser implements TParser {
    public internalTemplateParser: InternalTemplateParser;
	public userTemplateParser: UserTemplateParser;
    public current_context: {};
    
    constructor(private app: App, private plugin: TemplaterPlugin) {
        this.internalTemplateParser = new InternalTemplateParser(this.app, this.plugin);
        this.userTemplateParser = new UserTemplateParser(this.app, this.plugin);
    }

    async init(): Promise<void> {
        await this.internalTemplateParser.init();
        await this.userTemplateParser.init();
    }

    async setCurrentContext(config: RunningConfig, context_mode: ContextMode): Promise<void> {
        this.current_context = await this.generateContext(config, context_mode);
    }

    additionalContext(): {} {
        return {
            obsidian: obsidian_module,
        };
    }

    async generateContext(config: RunningConfig, context_mode: ContextMode = ContextMode.USER_INTERNAL): Promise<{}> {
        const context = {};
        const additional_context = this.additionalContext();
        const internal_context = await this.internalTemplateParser.generateContext(config);
        let user_context = {};

        if (!this.current_context) {
            // If a user system command is using tp.file.include, we need the context to be set.
            this.current_context = internal_context;
        }

        Object.assign(context, additional_context);
        switch (context_mode) {
            case ContextMode.INTERNAL:
                Object.assign(context, internal_context);
                break;
            case ContextMode.DYNAMIC:
                user_context = await this.userTemplateParser.generateContext(config);
                Object.assign(context, {
                    dynamic: {
                        ...internal_context,
                        user: user_context,
                    }
                });
                break;
            case ContextMode.USER_INTERNAL:
                user_context = await this.userTemplateParser.generateContext(config);
                Object.assign(context, {
                    ...internal_context,
                    user: user_context,
                });
                break;
        }

        return context;
    }

    async parseTemplates(content: string, context?: any, throw_on_error: boolean = false): Promise<string> {
        if (!context) {
            context = this.current_context;
        }

        // TODO
        /*
        try {
            content = await Eta.renderAsync(content, context, {
                varName: "tp",
                parse: {
                    exec: "*",
                    interpolate: "~",
                    raw: "",
                },
                autoTrim: false,
                globalAwait: true,
            }) as string;
        }
        catch(error) {
            this.plugin.log_error("Template parsing error, aborting.", error);
            if (throw_on_error) {
                throw error;
            }
        }
        */

        content = await Eta.renderAsync(content, context, {
            varName: "tp",
            parse: {
                exec: "*",
                interpolate: "~",
                raw: "",
            },
            autoTrim: false,
            globalAwait: true,
        }) as string;

        return content;
    }
}