import { expect } from "chai";
import TestTemplaterPlugin from "../../main.test";

export function InternalModuleConfigTests(t: TestTemplaterPlugin) {
    t.test("tp.config", async () => {
        await expect(
            t.run_and_get_output(
                "Template file: <% tp.config.template_file.path %>\n\n",
                ""
            )
        ).to.eventually.equal(`Template file: ${t.template_file.path}\n\n`);
        await expect(
            t.run_and_get_output(
                "Target file: <% tp.config.target_file.path %>\n\n",
                ""
            )
        ).to.eventually.equal(`Target file: ${t.target_file.path}\n\n`);
        await expect(
            t.run_and_get_output("Run mode: <% tp.config.run_mode %>\n\n", "")
        ).to.eventually.equal("Run mode: 2\n\n");
    });
}
