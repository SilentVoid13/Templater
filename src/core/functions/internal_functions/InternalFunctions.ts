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
    private modules: Array<Array<InternalModule>> = [];

    constructor(protected plugin: TemplaterPlugin) {
        this.modules = [];
    }

    async init(): Promise<void> {}

    async teardown(): Promise<void> {
        this.modules.forEach(async (module_array) => {
            module_array.forEach(async (mod) => {
                await mod.teardown();
            });
        });
        this.modules = [];
    }

    async generate_object(
        config: RunningConfig
    ): Promise<Record<string, unknown>> {
        const modules_array = [
            new InternalModuleDate(this.plugin),
            new InternalModuleFile(this.plugin),
            new InternalModuleWeb(this.plugin),
            new InternalModuleFrontmatter(this.plugin),
            new InternalModuleHooks(this.plugin),
            new InternalModuleSystem(this.plugin),
            new InternalModuleConfig(this.plugin),
        ];
        const internal_functions_object: { [key: string]: unknown } = {};

        for (const mod of modules_array) {
            await mod.init();
            internal_functions_object[mod.getName()] =
                await mod.generate_object(config);
        }

        this.modules.push(modules_array);

        return internal_functions_object;
    }
}
