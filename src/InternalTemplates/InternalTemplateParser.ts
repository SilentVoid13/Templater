import { App, Notice } from "obsidian";

import { AbstractTemplateParser } from "src/AbstractTemplateParser";
import { InternalModuleDate } from "./date/InternalModuleDate";
import { InternalModuleFile } from "./file/InternalModuleFile";
import { InternalModule } from "./InternalModule";
import { InternalModuleTitle } from "./title/InternalModuleTitle";
import { InternalModuleWeb } from "./web/InternalModuleWeb";

const INCLUSION_LIMIT = 10;

export class InternalTemplateParser extends AbstractTemplateParser {
    modules: Map<string, InternalModule>;

    constructor(app: App) {
        super(app);
        this.modules = new Map();
        this.registerModules();
    }

    registerModules() {
        this.modules.set("date", new InternalModuleDate(this.app));
        this.modules.set("title", new InternalModuleTitle(this.app));
        this.modules.set("file", new InternalModuleFile(this.app));
        this.modules.set("web", new InternalModuleWeb(this.app));
    }

    async parseTemplates(content: string) {
        let nested_count = 0;
        let children: Array<number> = Array();

        for (let module_key of Array.from(this.modules.keys())) {
            let pattern = `{{[ \\t]*tp.${module_key}.([a-z_]+)[ \\t]*(?::(.*?))?}}`;
            let regex = new RegExp(pattern);
            let global_regex = new RegExp(pattern, "g");
            let match;
    
            while((match = regex.exec(content)) !== null) {
                let attribute_name = match[1];
    
                let args = {};
                if (match[2] !== null) {
                    args = this.parseArguments(match[2]);
                }
    
                try {
                    if (nested_count < INCLUSION_LIMIT) {
                        let new_content = await this.modules.get(module_key).triggerTemplate(attribute_name, args);
                        content = content.replace(
                            match[0], 
                            new_content
                        );
    
                        if (module_key === "include") {
                            let n_child = (new_content.match(global_regex) || []).length;
    
                            if (n_child > 0) {
                                nested_count += 1;
                                children.push(n_child);
                            }
                            else {
                                let i = children.length-1;
                                while (children[i--] === 1) {
                                    children.pop();
                                    nested_count -= 1;
                                }
                                children[children.length-1] -= 1;
                            }
                        }
                    }
                    else {
                        throw new Error("Reached inclusion depth limit (max: 10), tp_include ignored");
                    }
                }
                catch(error) {
                    console.log(`Error with internal template tp.${module_key}.${attribute_name}: ${error}`);
                    new Notice(`Error with internal template tp.${module_key}.${attribute_name}, check the console for more informations.`);
    
                    content = content.replace(
                        match[0], 
                        "Internal_Template_Error"
                    );
                }
            }
        }

        return content;
    }
}