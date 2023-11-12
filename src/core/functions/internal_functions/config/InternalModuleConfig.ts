import { InternalModule } from "../InternalModule";
import { RunningConfig } from "core/Templater";
import { ModuleName } from "editor/TpDocumentation";

export class InternalModuleConfig extends InternalModule {
    public name: ModuleName = "config";

    async create_static_templates(): Promise<void> {}

    async create_dynamic_templates(): Promise<void> {}

    async teardown(): Promise<void> {}

    async generate_object(
        config: RunningConfig
    ): Promise<Record<string, unknown>> {
        return config;
    }
}
