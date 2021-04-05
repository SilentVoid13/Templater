import TemplaterPlugin from "main";
import { App, TFile } from "obsidian";
import { TParser } from "TParser";

export abstract class InternalModule extends TParser {
    public abstract name: string;
    templates: Map<string, any>;

    constructor(app: App, protected plugin: TemplaterPlugin, protected file: TFile) {
        super(app);
        this.templates = new Map();
    }

    abstract generateTemplates(): Promise<void>;

    async generateContext() {
        await this.generateTemplates();
        return Object.fromEntries(this.templates);
    }
}