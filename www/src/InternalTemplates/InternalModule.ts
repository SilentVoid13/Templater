import TemplaterPlugin from "main";
import { App } from "obsidian";
import { RunningConfig } from "Templater";
import { TParser } from "TParser";

export abstract class InternalModule implements TParser {
    protected abstract name: string;
    protected static_templates: Map<string, any> = new Map();
    protected dynamic_templates: Map<string, any> = new Map();
    protected config: RunningConfig;
    private static_context: {[x: string]: any};

    constructor(protected app: App, protected plugin: TemplaterPlugin) {}

    getName(): string {
        return this.name
    }

    abstract createStaticTemplates(): Promise<void>;
    abstract updateTemplates(): Promise<void>;

    async init(): Promise<void> {
        await this.createStaticTemplates();
        this.static_context = Object.fromEntries(this.static_templates);
    }

    async generateContext(config: RunningConfig): Promise<{[x: string]: any}> {
        this.config = config;
        await this.updateTemplates();

        return {
            ...this.static_context,
            ...Object.fromEntries(this.dynamic_templates),
        };
    }
}