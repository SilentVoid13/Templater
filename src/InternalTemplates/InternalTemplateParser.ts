import { App, TFile } from "obsidian";

import TemplaterPlugin from "main";
import { TParser } from "TParser";
import { InternalModule } from "./InternalModule";
import { InternalModuleDate } from "./date/InternalModuleDate";
import { InternalModuleFile } from "./file/InternalModuleFile";
import { InternalModuleWeb } from "./web/InternalModuleWeb";
import { InternalModuleFrontmatter } from "./frontmatter/InternalModuleFrontmatter";
import { InternalModuleSystem } from "./system/InternalModuleSystem";
import { RunningConfig } from "Templater";

export class InternalTemplateParser implements TParser {
    private modules_array: Array<InternalModule> = new Array();

    constructor(protected app: App, protected plugin: TemplaterPlugin) {
        this.modules_array.push(new InternalModuleDate(this.app, this.plugin));
        this.modules_array.push(new InternalModuleFile(this.app, this.plugin));
        this.modules_array.push(new InternalModuleWeb(this.app, this.plugin));
        this.modules_array.push(new InternalModuleFrontmatter(this.app, this.plugin));
        this.modules_array.push(new InternalModuleSystem(this.app, this.plugin));
    }

    async init(): Promise<void> {
        for (const mod of this.modules_array) {
            await mod.init();
        }
    }

    async generateContext(config: RunningConfig): Promise<{}> {
        const modules_context: {[key: string]: any} = {};

        for (const mod of this.modules_array) {
            modules_context[mod.getName()] = await mod.generateContext(config);
        }
        console.log(modules_context);

        return modules_context;
    }
}