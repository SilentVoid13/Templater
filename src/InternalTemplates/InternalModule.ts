import { App, TFile } from "obsidian";

export abstract class InternalModule {
    public abstract name: string;
    templates: Map<string, any>;

    constructor(public app: App, public file: TFile) {
        this.templates = new Map();
    }

    abstract generateTemplates(): Promise<void>;

    generateContext() {
        return Object.fromEntries(this.templates);
    }
}