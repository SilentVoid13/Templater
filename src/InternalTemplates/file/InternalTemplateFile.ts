import { App } from "obsidian";
import { InternalTemplate } from "../InternalTemplate";

export abstract class InternalTemplateFile extends InternalTemplate {
    file: string;
    relative: string;
    format: string;
    
    constructor(app: App, args: {[key: string]: string}) {
        super(app, args);
        this.file = this.get_argument("file") ?? "";
        this.relative = this.get_argument("rel") ?? "false";
        this.format = this.get_argument("f") ?? "YYYY-MM-DD HH:mm";
    }
}