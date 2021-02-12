import { App } from "obsidian";
import { InternalTemplate } from "../InternalTemplate";

export abstract class InternalTemplateTitle extends InternalTemplate {
    title: string;
    format: string;
    title_format: string;
    offset: number;

    constructor(app: App, args: {[key: string]: string}) {
        super(app, args);
        this.format = this.get_argument("f") ?? "YYYY-MM-DD";
        this.title_format = this.get_argument("title_f") ?? "YYYY-MM-DD";
        this.offset = Number(this.get_argument("offset") ?? "0");
        this.title = this.getTitle();
    }

    getTitle(): string {
        let activeLeaf = this.app.workspace.activeLeaf;
        if (activeLeaf == null) {
            throw new Error("app.activeLeaf is null");
        }
        return activeLeaf.getDisplayText();
    }
}