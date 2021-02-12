import { App } from "obsidian";
import { InternalTemplateConstructor } from "./InternalTemplate";

export abstract class InternalModule {
    templates: Map<string, InternalTemplateConstructor>;

    constructor(public app: App) {
        this.templates = new Map();
        this.registerTemplates();
    }

    abstract registerTemplates(): void;

    async triggerTemplate(attribute: string, args: {[key: string]: string}) {
        let template_item = this.templates.get(attribute);
        if (template_item === undefined) {
            throw new Error(`${attribute} doesn't exist`);
        }
        let template = new template_item(this.app, args);

        return await template.render();
    }
}