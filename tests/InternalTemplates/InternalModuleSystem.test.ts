import { expect } from "chai";
import TestTemplaterPlugin from "../../main.test";

export function InternalModuleSystemTests(t: TestTemplaterPlugin) {
    t.test("tp.system.clipboard", async () => {
        const clipboard_content = "This some test\n\ncontent\n\n";
        await navigator.clipboard.writeText(clipboard_content);
        await expect(
            t.run_and_get_output(
                `Clipboard content: <% tp.system.clipboard() %>`
            )
        ).to.eventually.equal(`Clipboard content: ${clipboard_content}`);
    });

    t.test("tp.system.prompt", async () => {
        // TODO
    });

    t.test("tp.system.suggester", async () => {
        // TODO
    });
}
