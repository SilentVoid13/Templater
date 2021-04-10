import TemplaterPlugin from "main";
import { App, TFile } from "obsidian";
import { TParser } from "TParser";

export abstract class InternalModule extends TParser {
    protected abstract name: string;
    protected static_templates: Map<string, any> = new Map();
    protected dynamic_templates: Map<string, any> = new Map();
    protected file: TFile;

    constructor(app: App, protected plugin: TemplaterPlugin) {
        super(app);
    }

    getName(): String {
        return this.name
    }

    abstract createStaticTemplates(): Promise<void>;
    abstract updateTemplates(): Promise<void>;

    async generateContext(file: TFile) {
        this.file = file;

        if (this.static_templates.size === 0) {
            await this.createStaticTemplates();
        }
        await this.updateTemplates();

        return {
            ...Object.fromEntries(this.static_templates),
            ...Object.fromEntries(this.dynamic_templates),
        }
    }
}