import { App } from "obsidian";

import TemplaterPlugin from "main";
import { IGenerateObject } from "functions/IGenerateObject";
import { InternalModule } from "./InternalModule";
import { InternalModuleDate } from "./date/InternalModuleDate";
import { InternalModuleFile } from "./file/InternalModuleFile";
import { InternalModuleWeb } from "./web/InternalModuleWeb";
import { InternalModuleFrontmatter } from "./frontmatter/InternalModuleFrontmatter";
import { InternalModuleSystem } from "./system/InternalModuleSystem";
import { RunningConfig } from "Templater";
import { InternalModuleConfig } from "./config/InternalModuleConfig";

export class InternalFunctions implements IGenerateObject {
    private modules_array: Array<InternalModule> = new Array();

    constructor(protected app: App, protected plugin: TemplaterPlugin) {
        this.modules_array.push(new InternalModuleDate(this.app, this.plugin));
        this.modules_array.push(new InternalModuleFile(this.app, this.plugin));
        this.modules_array.push(new InternalModuleWeb(this.app, this.plugin));
        this.modules_array.push(
            new InternalModuleFrontmatter(this.app, this.plugin)
        );
        this.modules_array.push(
            new InternalModuleSystem(this.app, this.plugin)
        );
        this.modules_array.push(
            new InternalModuleConfig(this.app, this.plugin)
        );
    }

    async init(): Promise<void> {
        for (const mod of this.modules_array) {
            await mod.init();
        }
    }

    async generate_object(config: RunningConfig): Promise<{}> {
        const internal_functions_object: { [key: string]: any } = {};

        for (const mod of this.modules_array) {
            internal_functions_object[mod.getName()] =
                await mod.generate_object(config);
        }

        return internal_functions_object;
    }
}
