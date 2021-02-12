import { App } from "obsidian";

export abstract class AbstractTemplateParser {
    constructor(public app: App) {}

    abstract parseTemplates(content: string): Promise<string>;

    parseArguments(arg_str: string): {[key: string]: string} {
        arg_str += ",";
        let regex = /[ \t]*([^=\n\r]+)=(?:(?:[ \t]*(?:"([^"\\\n\r]*(?:\\.[^"\\\n\r]*)*)")[ \t]*)|(?:[ \t]*(?:'([^'\\\n\r]*(?:\\.[^'\\\n\r]*)*)')[ \t]*)|([^,\n\r]+)),[ \t]*/gmi;
        let args: {[key: string]: string} = {};
        let match;

        while((match = regex.exec(arg_str)) !== null) {
            let value; 
            
            // Double quotes
            if (match[2] !== undefined) {
                value = match[2];
            }
            // Single quotes
            else if (match[3] !== undefined) {
                value = match[3];
            }
            // No quotes
            else {
                value = match[4];
            }

            value = value.replace(new RegExp("\\\\'", "g"), "'");
            value = value.replace(new RegExp("\\\\\"", "g"), "\"");

            args[match[1]] = value;
        }

        return args;
    }
}
