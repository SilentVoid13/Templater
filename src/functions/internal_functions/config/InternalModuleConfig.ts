import { InternalModule } from "functions/internal_functions/InternalModule";
import { RunningConfig } from "Templater";
import { ModuleName } from "functions/TpDocumentation";

export class InternalModuleConfig extends InternalModule {
    public name: ModuleName = "config";

    async create_static_templates(): Promise<void> {}

    async create_dynamic_templates(): Promise<void> {}

    async generate_object(
        config: RunningConfig
    ): Promise<Record<string, unknown>> {
        return config;
    }
}
