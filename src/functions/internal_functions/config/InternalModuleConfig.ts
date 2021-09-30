import { InternalModule } from "functions/internal_functions/InternalModule";
import { RunningConfig } from "Templater";

export class InternalModuleConfig extends InternalModule {
    public name = "config";

    async create_static_templates(): Promise<void> {}

    async create_dynamic_templates(): Promise<void> {}

    async generate_object(
        config: RunningConfig
    ): Promise<Record<string, unknown>> {
        return config;
    }
}
