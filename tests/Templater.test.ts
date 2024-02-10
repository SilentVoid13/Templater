import { expect } from "chai";
import TestTemplaterPlugin from "../main.test";
import { properties_are_visible } from "./utils.test";

export function TemplaterTests(t: TestTemplaterPlugin) {
    t.test(
        "append_template_to_active_file shows properties in live preview",
        async () => {
            await t.run_in_new_leaf("---\nkey: value\n---\nText");
            expect(properties_are_visible()).to.be.true;
        }
    );
}
