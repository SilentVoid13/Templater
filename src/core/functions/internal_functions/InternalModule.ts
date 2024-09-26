import TemplaterPlugin from "main";
import { RunningConfig } from "core/Templater";
import { IGenerateObject } from "core/functions/IGenerateObject";
import { ModuleName } from "editor/TpDocumentation";

export abstract class InternalModule implements IGenerateObject {
    public abstract name: ModuleName;
    protected static_functions: Map<string, unknown> = new Map();
    protected dynamic_functions: Map<string, unknown> = new Map();
    protected config: RunningConfig;
    protected static_object: { [x: string]: unknown };

    constructor(protected plugin: TemplaterPlugin) {}

    getName(): ModuleName {
        return this.name;
    }

    abstract create_static_templates(): Promise<void>;
    abstract create_dynamic_templates(): Promise<void>;
    abstract teardown(): Promise<void>;

    async init(): Promise<void> {
        await this.create_static_templates();
        this.static_object = Object.fromEntries(this.static_functions);
    }

    async generate_object(
        new_config: RunningConfig
    ): Promise<Record<string, unknown>> {
        this.config = new_config;
        await this.create_dynamic_templates();

        return {
            ...this.static_object,
            ...Object.fromEntries(this.dynamic_functions),
        };
    }
}
