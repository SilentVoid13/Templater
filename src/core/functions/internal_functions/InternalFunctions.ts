import TemplaterPlugin from "main";
import { IGenerateObject } from "core/functions/IGenerateObject";
import { InternalModule } from "./InternalModule";
import { InternalModuleDate } from "./date/InternalModuleDate";
import { InternalModuleFile } from "./file/InternalModuleFile";
import { InternalModuleWeb } from "./web/InternalModuleWeb";
import { InternalModuleHooks } from "./hooks/InternalModuleHooks";
import { InternalModuleFrontmatter } from "./frontmatter/InternalModuleFrontmatter";
import { InternalModuleSystem } from "./system/InternalModuleSystem";
import { RunningConfig } from "core/Templater";
import { InternalModuleConfig } from "./config/InternalModuleConfig";

export class InternalFunctions implements IGenerateObject {
    private modules_array: Array<InternalModule> = [];

    constructor(protected plugin: TemplaterPlugin) {
        this.modules_array.push(new InternalModuleDate(this.plugin));
        this.modules_array.push(new InternalModuleFile(this.plugin));
        this.modules_array.push(new InternalModuleWeb(this.plugin));
        this.modules_array.push(new InternalModuleFrontmatter(this.plugin));
        this.modules_array.push(new InternalModuleHooks(this.plugin));
        this.modules_array.push(new InternalModuleSystem(this.plugin));
        this.modules_array.push(new InternalModuleConfig(this.plugin));
    }

    async init(): Promise<void> {
        for (const mod of this.modules_array) {
            await mod.init();
        }
    }

    async teardown(): Promise<void> {
        for (const mod of this.modules_array) {
            await mod.teardown();
        }
    }

    async generate_object(
        config: RunningConfig
    ): Promise<Record<string, unknown>> {
        const internal_functions_object: { [key: string]: unknown } = {};

        for (const mod of this.modules_array) {
            internal_functions_object[mod.getName()] =
                await mod.generate_object(config);
        }

        return internal_functions_object;
    }
}
