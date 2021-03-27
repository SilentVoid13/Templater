import { App, FileSystemAdapter, Notice, TFile } from "obsidian";
import * as nunjucks from "nunjucks";
import { exec } from "child_process";
import { promisify } from "util";

import TemplaterPlugin from "main";
import { ContextMode, TemplateParser } from "TemplateParser";
import { TParser } from "TParser";

export class UserTemplateParser extends TParser {
    cwd: string;
    cmd_options: any;

    constructor(app: App, private plugin: TemplaterPlugin, private template_parser: TemplateParser) {
        super(app);
        this.resolveCwd();        
    }

    static createUserTemplateParser(app: App, plugin: TemplaterPlugin, template_parser: TemplateParser): UserTemplateParser {
        // TODO: Maybe find a better way to check for this
        if (require("child_process") === undefined) {
            return undefined;
        }
        return new UserTemplateParser(app, plugin, template_parser);
    }

    resolveCwd() {
        if (!(this.app.vault.adapter instanceof FileSystemAdapter)) {
            this.cwd = "";
        }
        else {
            this.cwd = this.app.vault.adapter.getBasePath();
        }
    }

    async generateUserTemplates(file: TFile) {
        let user_templates = new Map();
        const exec_promise = promisify(exec);

        for (let [template, cmd] of this.plugin.settings.templates_pairs) {
            if (template === "" || cmd === "") {
                continue;
            }

            cmd = await this.template_parser.parseTemplates(cmd, file, ContextMode.INTERNAL);

            user_templates.set(template, async (kwargs: any): Promise<string> => {
                try {
                    let process_env = {
                        ...process.env,
                        ...kwargs
                    };

                    let cmd_options = {
                        timeout: this.plugin.settings.command_timeout * 1000,
                        cwd: this.cwd,
                        env: process_env,
                    };

                    let {stdout} = await exec_promise(cmd, cmd_options);
                    return stdout;
                }
                catch(error) {
                    this.plugin.log_error(`Error with User Template ${template}`, error);
                }
            })
        }

        return user_templates;
    }

    async generateContext(file: TFile) {
        let user_templates = await this.generateUserTemplates(file);
        return Object.fromEntries(user_templates);
    }
}