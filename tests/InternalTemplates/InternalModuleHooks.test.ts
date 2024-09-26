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
            await t.run_in_new_leaf(template, "", true);
            expect(properties_are_visible()).to.be.true;
            await expect(
                t.run_and_get_output(template, "", true)
            ).to.eventually.equal("\nTEXT THAT SHOULD STAY");
            await expect(
                t.create_new_note_from_template_and_get_output(template)
            ).to.eventually.equal(
                "---\nkey: value\n---\n\nTEXT THAT SHOULD STAY"
            );
        }
    );
}
