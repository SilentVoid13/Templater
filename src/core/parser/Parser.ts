import { renderAsync } from "eta";

export class Parser {
    async parse_commands(
        content: string,
        object: Record<string, unknown>
    ): Promise<string> {
        content = (await renderAsync(content, object, {
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
