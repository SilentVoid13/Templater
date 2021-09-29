import * as Eta from "eta";

export class Parser {
    constructor() {}

    async parse_commands(content: string, object: any): Promise<string> {
        content = (await Eta.renderAsync(content, object, {
            varName: "tp",
            parse: {
                exec: "*",
                interpolate: "~",
                raw: "",
            },
            autoTrim: false,
            globalAwait: true,
        })) as string;

        return content;
    }
}
