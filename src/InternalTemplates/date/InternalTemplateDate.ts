import { App } from "obsidian";
import { InternalTemplate } from "../InternalTemplate";

export abstract class InternalTemplateDate extends InternalTemplate {
    format: string;
    offset: number;
    
    constructor(app: App, args: {[key: string]: string}) {
        super(app, args);
        this.format = this.get_argument("f") ?? "YYYY-MM-DD";
        this.offset = Number(this.get_argument("offset") ?? "0");
    }
}