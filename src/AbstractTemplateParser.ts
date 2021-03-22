import { App, TFile } from "obsidian";

export abstract class AbstractTemplateParser {
    constructor(public app: App) {}

    abstract parseTemplates(content: string, file: TFile): Promise<string>;
}
