import { App, TFile } from "obsidian";

import TemplaterPlugin from "main";
import { TParser } from "TParser";
import { InternalModule } from "./InternalModule";
import { InternalModuleDate } from "./date/InternalModuleDate";
import { InternalModuleFile } from "./file/InternalModuleFile";
import { InternalModuleWeb } from "./web/InternalModuleWeb";
import { InternalModuleFrontmatter } from "./frontmatter/InternalModuleFrontmatter";
import { InternalModuleSystem } from "./system/InternalModuleSystem";

export class InternalTemplateParser extends TParser {
    private modules_array: Array<InternalModule> = new Array();

    constructor(app: App, private plugin: TemplaterPlugin) {
        super(app);
        this.createModules();
    }

    createModules() {
        this.modules_array.push(new InternalModuleDate(this.app, this.plugin));
        this.modules_array.push(new InternalModuleFile(this.app, this.plugin));
        this.modules_array.push(new InternalModuleWeb(this.app, this.plugin));
        this.modules_array.push(new InternalModuleFrontmatter(this.app, this.plugin));
        this.modules_array.push(new InternalModuleSystem(this.app, this.plugin));
    }

    async generateContext(f: TFile) {
        let modules_context_map = new Map();

        for (let mod of this.modules_array) {
            modules_context_map.set(mod.getName(), await mod.generateContext(f));
        }

       return Object.fromEntries(modules_context_map);
    }
}