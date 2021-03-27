import * as nunjucks from "nunjucks";
import { App, TFile } from "obsidian";

import { InternalModuleDate } from "./date/InternalModuleDate";
import { InternalModuleFile } from "./file/InternalModuleFile";
import { InternalModuleWeb } from "./web/InternalModuleWeb";
import { InternalModuleFrontmatter } from "./frontmatter/InternalModuleFrontmatter";
import { InternalModule } from "./InternalModule";
import { TParser } from "TParser";

export class InternalTemplateParser extends TParser {
    env: nunjucks.Environment;

    constructor(app: App) {
        super(app);
        this.env = nunjucks.configure({
            throwOnUndefined: false,
        });
    }

    async generateModules(f: TFile) {
        let modules_map: Map<string, any> = new Map();
        let modules_array: Array<InternalModule> = new Array();
        modules_array.push(new InternalModuleDate(this.app, f));
        modules_array.push(new InternalModuleFile(this.app, f));
        modules_array.push(new InternalModuleWeb(this.app, f));
        modules_array.push(new InternalModuleFrontmatter(this.app, f));

        for (let mod of modules_array) {
            await mod.generateTemplates();
            modules_map.set(mod.name, mod.generateContext());
        }

        return modules_map;
    }

    async generateContext(f: TFile) {
       let modules = await this.generateModules(f);

       return {
           // Ugly hack to prevent nunjucks to output empty string
           cursor: "{{tp.cursor}}",
           ...Object.fromEntries(modules),
       };
    }
}