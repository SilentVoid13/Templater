import { expect } from "chai";
import TestTemplaterPlugin from "../../main.test";
import { properties_are_visible } from "../utils.test";

export function InternalModuleHooksTests(t: TestTemplaterPlugin) {
    t.test(
        "tp.hooks.on_all_templates_executed shows properties in live preview",
        async () => {
            const template = `<%*
tp.hooks.on_all_templates_executed(async () => {
  const file = tp.file.find_tfile(tp.file.path(true));
  await app.fileManager.processFrontMatter(file, (frontmatter) => {
    frontmatter["key"] = "value";
  });
});
%>
TEXT THAT SHOULD STAY`;
            const content = await t.run_in_new_leaf_and_get_output(
                template,
                "",
                true
            );
            expect(properties_are_visible()).to.be.true;
            expect(content).to.equal(
                "---\nkey: value\n---\n\nTEXT THAT SHOULD STAY"
            );
        }
    );
}
