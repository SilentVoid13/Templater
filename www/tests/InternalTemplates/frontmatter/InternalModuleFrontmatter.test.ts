import { expect } from "chai";
import TestTemplaterPlugin from "../../main.test";

export function InternalModuleFrontmatterTests(t: TestTemplaterPlugin) {
    t.test("tp.frontmatter", async () => {
        const template_content = `field1: <% tp.frontmatter.field1 %>
field2 with space: <% tp.frontmatter["field2 with space"] %>
field3 array: <% tp.frontmatter.field3 %>
field4 array: <% tp.frontmatter.field4 %>
`;

        const target_content = `---
field1: test
field2 with space: test test
field3: ["a", "b", "c"]
field4:
- a
- b
- c
---`;

        const expected_content = `field1: test
field2 with space: test test
field3 array: a,b,c
field4 array: a,b,c
`;
        await expect(
            t.run_and_get_output(template_content, target_content, true)
        ).to.eventually.equal(expected_content);
    });
}
