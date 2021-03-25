import { AbstractTemplateParser } from "AbstractTemplateParser";
import { InternalTemplateParser } from "InternalTemplates/InternalTemplateParser"
import TemplaterPlugin from "main";
import { App, FileSystemAdapter, Notice, TFile } from "obsidian";

export class UserTemplateParser extends AbstractTemplateParser {
    cwd: string;

    constructor(app: App, private plugin: TemplaterPlugin, private internalTemplateParser: InternalTemplateParser) {
        super(app);
        this.resolveCwd();        
    }

    static createUserTemplateParser(app: App, plugin: TemplaterPlugin, internalTemplateParser: InternalTemplateParser): UserTemplateParser {
        // TODO: Maybe find a better way to check for this
        if (require("child_process") === undefined) {
            return undefined;
        }
        return new UserTemplateParser(app, plugin, internalTemplateParser);
    }

    resolveCwd() {
        if (!(this.app.vault.adapter instanceof FileSystemAdapter)) {
            this.cwd = "";
        }
        else {
            this.cwd = this.app.vault.adapter.getBasePath();
        }
    }

    async parseTemplates(content: string, file: TFile) {
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

        return content;
    }
}