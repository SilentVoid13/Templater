import { App, FileSystemAdapter } from "obsidian";
import { exec } from "child_process";
import { promisify } from "util";

import TemplaterPlugin from "main";
import { ContextMode } from "TemplateParser";
import { TParser } from "TParser";
import { UNSUPPORTED_MOBILE_TEMPLATE } from "Constants";
import { RunningConfig } from "Templater";

export class UserTemplateParser implements TParser {
    private cwd: string;
    private exec_promise: Function;

    constructor(private app: App, private plugin: TemplaterPlugin) {
        this.setup();        
    }

    setup(): void {
        // TODO: Add mobile support
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

    async generateUserTemplates(config: RunningConfig): Promise<Map<string, Function>> {
        const user_templates = new Map();

        const context = await this.plugin.templater.parser.generateContext(config, ContextMode.INTERNAL);

        for (let [template, cmd] of this.plugin.settings.templates_pairs) {
            if (template === "" || cmd === "") {
                continue;
            }

            // @ts-ignore
            if (this.app.isMobile) {
                user_templates.set(template, (user_args?: any): string => {
                    return UNSUPPORTED_MOBILE_TEMPLATE;
                })
            }
            else {
                cmd = await this.plugin.templater.parser.parseTemplates(cmd, context);

                user_templates.set(template, async (user_args?: any): Promise<string> => {
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
                        this.plugin.log_error(`Error with User Template ${template}`, error);
                    }
                });
            }
        }

        return user_templates;
    }

    async generateContext(config: RunningConfig): Promise<{}> {
        const user_templates = this.plugin.settings.enable_system_commands ? await this.generateUserTemplates(config) : new Map();

        return {
            ...Object.fromEntries(user_templates),
        };
    }
}