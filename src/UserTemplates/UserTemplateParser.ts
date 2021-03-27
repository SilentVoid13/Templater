import { App, FileSystemAdapter, Notice, TFile } from "obsidian";
import * as nunjucks from "nunjucks";
import { exec } from "child_process";
import { promisify } from "util";

import TemplaterPlugin from "main";
import { Parser, TemplateParser } from "TemplateParser";

export class UserTemplateParser extends Parser {
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

        let cmd_options = {
            timeout: this.plugin.settings.command_timeout,
            cwd: this.cwd,
        }

        for (let [template, cmd] of this.plugin.settings.templates_pairs) {
            if (template === "" || cmd === "") {
                continue;
            }

            cmd = await this.template_parser.parseTemplates(cmd, file);

            user_templates.set(template, async (): Promise<string> => {
                try {
                    let {stdout, stderr} = await exec_promise(cmd, cmd_options);
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

    async parseTemplates(content: string, file: TFile) {
        /*
        let child_process = require("child_process");
        if (child_process === undefined) {
            throw new Error("nodejs child_process loading failure.");
        }
        const util = require("util");
        if (util === undefined) {
            throw new Error("nodejs util loading failure.");
        }
        const exec_promise = util.promisify(child_process.exec);

        for (let i = 0; i < this.plugin.settings.templates_pairs.length; i++) {
            let template_pair = this.plugin.settings.templates_pairs[i];
            let template = template_pair[0];
            let cmd = template_pair[1];
            if (template === "" || cmd === "") {
                continue;
            }

            cmd = await this.internalTemplateParser.parseTemplates(cmd, file);

            if (content.contains(template)) {
                try {
                    let process_env = process.env;
                    process_env["test"] = "test";
                    console.log("PROCESS_ENV:", process_env);

                    let {stdout, stderr} = await exec_promise(cmd, {
                        timeout: this.plugin.settings.command_timeout*1000,
                        cwd: this.cwd
                    });
                    
                    content = content.replace(
                        new RegExp(template, "g"), 
                        stdout.trim()
                    );
                }
                catch(error) {
                    console.log(`Error with the template n° ${(i+1)}:\n`, error);
                    new Notice("Error with the template n°" + (i+1) + " (check console for more informations)");
                }
            }
        }
        */

        let context = await this.generateContext(file);
        console.log("USER_CONTEXT:", context);
        content = nunjucks.renderString(content, context);

        return content;
    }
}