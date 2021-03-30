import { App, TFile } from "obsidian";

export function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
};

export abstract class TParser {
    constructor(public app: App) {}
    abstract generateContext(file: TFile): Promise<any>;
}