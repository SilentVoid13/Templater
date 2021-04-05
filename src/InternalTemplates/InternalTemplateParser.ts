import { App, TFile } from "obsidian";

import { InternalModuleDate } from "./date/InternalModuleDate";
import { InternalModuleFile } from "./file/InternalModuleFile";
import { InternalModuleWeb } from "./web/InternalModuleWeb";
import { InternalModuleFrontmatter } from "./frontmatter/InternalModuleFrontmatter";
import { InternalModule } from "./InternalModule";
import { TParser } from "TParser";
import TemplaterPlugin from "main";

export class InternalTemplateParser extends TParser {
    constructor(app: App, private plugin: TemplaterPlugin) {
        super(app);
    }

    async generateModules(f: TFile) {
        let modules_map: Map<string, any> = new Map();
        let modules_array: Array<InternalModule> = new Array();
        modules_array.push(new InternalModuleDate(this.app, this.plugin, f));
        modules_array.push(new InternalModuleFile(this.app, this.plugin, f));
        modules_array.push(new InternalModuleWeb(this.app, this.plugin, f));
        modules_array.push(new InternalModuleFrontmatter(this.app, this.plugin, f));

        for (let mod of modules_array) {
            modules_map.set(mod.name, await mod.generateContext());
        }

        return modules_map;
    }

    async generateContext(f: TFile) {
       let modules = await this.generateModules(f);

       return {
           ...Object.fromEntries(modules),
       };
    }
}