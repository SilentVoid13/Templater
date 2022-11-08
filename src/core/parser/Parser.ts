import init, { ParserConfig, Renderer } from "@silentvoid13/rusty_engine";

// TODO: find a cleaner way to embed wasm
// @ts-ignore
import { default as wasmbin } from "../../../node_modules/@silentvoid13/rusty_engine/rusty_engine_bg.wasm";

export class Parser {
    private renderer: Renderer;

    async init() {
        await init(wasmbin);
        const config = new ParserConfig("<%", "%>", "\0", "*", "-", "_", "tR");
        this.renderer = new Renderer(config);
    }

    async parse_commands(
        content: string,
        context: Record<string, unknown>
    ): Promise<string> {
        return this.renderer.render_content(content, context);
    }
}
