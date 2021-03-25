import * as nunjucks from "nunjucks";
import { App, TFile } from "obsidian";
//import * as Sqrl from "squirrelly";
//import * as ejs from "ejs";

import { AbstractTemplateParser } from "AbstractTemplateParser";
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
        this.env = nunjucks.configure({
            throwOnUndefined: false,
        });
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
        return {
            tp:
                {
                    ...Object.fromEntries(this.modules),
                    // TODO: Ugly hack to be able to keep tp.cursor inside the string content
                    // I need to find a better way
                    cursor: "{{tp.cursor}}",
                }
        };
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
        content = env.renderString(content, context);
        //content = env.renderString(content, context);
        //content = await Sqrl.render(content, context, {async: true, varName: "tp"});
        //content = await ejs.render(content, {tp: context}, {async: true});
        //content = es6Renderer(content, {template: true, local: {tp: context}});

        return content;
    }
}