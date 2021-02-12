import { AbstractTemplateParser } from "src/AbstractTemplateParser";
import TemplaterPlugin from "src/main";
import { InternalTemplateParser } from "src/InternalTemplates/InternalTemplateParser";

import { exec } from 'child_process';
import { promisify } from "util";
import { App, FileSystemAdapter, Notice } from "obsidian";

const exec_promise = promisify(exec);

export class UserTemplateParser extends AbstractTemplateParser {
    cwd: string;

    constructor(app: App, private plugin: TemplaterPlugin, private internalTemplateParser: InternalTemplateParser) {
        super(app);
        this.resolveCwd();        
    }

    resolveCwd() {
        if (!(this.app.vault.adapter instanceof FileSystemAdapter)) {
            this.cwd = "";
        }
        else {
            this.cwd = this.app.vault.adapter.getBasePath();
        }
    }

    async parseTemplates(content: string) {
        for (let i = 0; i < this.plugin.settings.templates_pairs.length; i++) {
            let template_pair = this.plugin.settings.templates_pairs[i];
            let template = template_pair[0];
            let cmd = template_pair[1];
            if (template === "" || cmd === "") {
                continue;
            }
            
            cmd = await this.internalTemplateParser.parseTemplates(cmd);

            if (content.contains(template)) {
                try {
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