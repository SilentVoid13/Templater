import { App, Notice, TFile } from "obsidian";
import * as nunjucks from "nunjucks";
import * as Sqrl from "squirrelly";
import * as ejs from "ejs";

import { AbstractTemplateParser } from "src/AbstractTemplateParser";
import { InternalModuleDate } from "./date/InternalModuleDate";
import { InternalModuleFile } from "./file/InternalModuleFile";
import { InternalModuleWeb } from "./web/InternalModuleWeb";
import axios from "axios";
import { InternalModuleFrontmatter } from "./frontmatter/InternalModuleFrontmatter";

export class InternalTemplateParser extends AbstractTemplateParser {
    env: nunjucks.Environment;
    modules: Map<String, any>;

    constructor(app: App) {
        super(app);
        this.env = new nunjucks.Environment();
        this.modules = new Map();
    }

    async registerModules(f: TFile) {
        let date = new InternalModuleDate(this.app, f);
        await date.registerTemplates();

        let file = new InternalModuleFile(this.app, f);
        await file.registerTemplates();

        let web = new InternalModuleWeb(this.app, f);
        await web.registerTemplates();

        let frontmatter = new InternalModuleFrontmatter(this.app, f);
        await frontmatter.registerTemplates();

        this.modules.set("date", date.generateContext());
        this.modules.set("file", file.generateContext());
        this.modules.set("web", web.generateContext());
        this.modules.set("frontmatter", frontmatter.generateContext());
    }

    async generateContext(f: TFile) {
        return Object.fromEntries(this.modules);
    }

    async parseTemplates(content: string, file: TFile) {
        await this.registerModules(file);

        /*
        let callback_test = (err, res) => {
            console.log("err:", err);
            console.log("res:", res);
        }

        let loader = nunjucks.Loader.extend({
            async: true,
            getSource: function(name, callback) {
                // load the template
                // ...
                callback(err, res);
            }
        });

        let env = new nunjucks.Environment(loader);
        */
       let env = this.env;

        console.log("content1:", content);
        let context = await this.generateContext(file);

        /*
        let context = {
            request: async () => {
                let response = await axios.get("...");
                return response.data.content;
            }
        };
        */

        console.log("CONTEXT:", context);
        console.log("ENV:", env);
        content = env.renderString(content, {tp: context});
        //content = env.renderString(content, context);
        //content = await Sqrl.render(content, context, {async: true, varName: "tp"});
        //content = await ejs.render(content, {tp: context}, {async: true});
        //content = es6Renderer(content, {template: true, local: {tp: context}});
        console.log("content2:", content);

        return content;
    }
}