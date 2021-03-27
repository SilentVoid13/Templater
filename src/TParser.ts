import { App, TFile } from "obsidian";

export abstract class TParser {
    constructor(public app: App) {}
    abstract generateContext(file: TFile): Promise<any>;
}