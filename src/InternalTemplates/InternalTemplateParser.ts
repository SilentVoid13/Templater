import { App, Notice, TFile } from "obsidian";
import * as nunjucks from "nunjucks";
//import * as Sqrl from "squirrelly";
//import * as ejs from "ejs";

import { AbstractTemplateParser } from "src/AbstractTemplateParser";
import { InternalModuleDate } from "./date/InternalModuleDate";
import { InternalModuleFile } from "./file/InternalModuleFile";
import { InternalModuleWeb } from "./web/InternalModuleWeb";
import { InternalModuleFrontmatter } from "./frontmatter/InternalModuleFrontmatter";
import { InternalModule } from "./InternalModule";

export class InternalTemplateParser extends AbstractTemplateParser {
    env: nunjucks.Environment;
    modules: Map<String, any>;

    constructor(app: App) {
        super(app);
        this.env = new nunjucks.Environment();
        this.modules = new Map();
    }

    async registerModules(f: TFile) {
        let modules: Array<InternalModule> = new Array();
        modules.push(new InternalModuleDate(this.app, f));
        modules.push(new InternalModuleFile(this.app, f));
        modules.push(new InternalModuleWeb(this.app, f));
        modules.push(new InternalModuleFrontmatter(this.app, f));

        for (let mod of modules) {
            await mod.registerTemplates();
            this.modules.set(mod.name, mod.generateContext());
        }

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