import TemplaterPlugin from "main";
import { App } from "obsidian";
import { RunningConfig } from "Templater";
import { IGenerateObject } from "functions/IGenerateObject";

export abstract class InternalModule implements IGenerateObject {
    public abstract name: string;
    protected static_functions: Map<string, unknown> = new Map();
    protected dynamic_functions: Map<string, unknown> = new Map();
    protected config: RunningConfig;
    protected static_object: { [x: string]: unknown };

    constructor(protected app: App, protected plugin: TemplaterPlugin) {}

    getName(): string {
        return this.name;
    }

    abstract create_static_templates(): Promise<void>;
    abstract create_dynamic_templates(): Promise<void>;

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
