import { App } from "obsidian";
import { InternalModule } from "./InternalModule";

export interface InternalTemplateConstructor {
    new (app: App, args: {[key: string]: string}): InternalTemplate;
}

/*
export interface InternalTemplateInterface {
    get_argument(arg_name: string): string;
    render(content: string): string;
}
*/

export abstract class InternalTemplate {
    constructor(public app: App, private args: {[key: string]: string}) {}

    abstract render(): Promise<string>;

    get_argument(arg_name: string): string {
        if (Object.keys(this.args).length === 0 || this.args[arg_name] === undefined) {
            return null;
        }
        return this.args[arg_name];
    }
}