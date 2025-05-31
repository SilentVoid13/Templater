import { expect } from "chai";
import TestTemplaterPlugin from "../main.test";
import { properties_are_visible } from "./utils.test";

export function TemplaterTests(t: TestTemplaterPlugin) {
    t.test(
        "append_template_to_active_file shows properties in live preview",
        async () => {
            const content = await t.run_in_new_leaf_and_get_output(
                "---\nkey: value\n---\nText"
            );
            expect(properties_are_visible()).to.be.true;
            expect(content).to.equal("---\nkey: value\n---\nText");
        }
    );
}
