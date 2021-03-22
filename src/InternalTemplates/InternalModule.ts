import { App, TFile } from "obsidian";

export abstract class InternalModule {
    templates: Map<string, any>;

    constructor(public app: App, public file: TFile) {
        this.templates = new Map();
    }

    abstract registerTemplates(): Promise<void>;

    generateContext() {
        return Object.fromEntries(this.templates);
    }
}