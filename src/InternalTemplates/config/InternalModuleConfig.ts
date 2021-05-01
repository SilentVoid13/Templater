import { InternalModule } from "InternalTemplates/InternalModule";
import { RunMode, RunningConfig } from "Templater";

export class InternalModuleConfig extends InternalModule {
    public name: string = "config";

    async createStaticTemplates(): Promise<void> {}

    async updateTemplates(): Promise<void> {}

    async generateContext(config: RunningConfig): Promise<{[x: string]: any}> {
        return config;
    }
}