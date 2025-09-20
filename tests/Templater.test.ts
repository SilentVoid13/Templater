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

    t.test(
        "append_template_to_active_file gracefully merges YAML primitives",
        async () => {
            const template_content =
                "---\n" +
                "only_in_template: template value\n" +
                "both: template value\n" +
                "---\n";
            const target_content =
                "---\n" +
                "only_in_target: target value\n" +
                "both: target value\n" +
                "---\n";
            const expected =
                "---\n" +
                "only_in_target: target value\n" +
                "both: template value\n" +
                "only_in_template: template value\n" +
                "---\n";
            const wait_cache = true;
            const actual = await t.run_in_new_leaf_and_get_output(
                template_content,
                target_content,
                wait_cache
            );
            expect(actual).to.equal(expected);
        }
    );

    t.test(
        "append_template_to_active_file gracefully merges YAML lists",
        async () => {
            const template_content =
                "---\n" +
                "only_in_template:\n" +
                "  - template_item1\n" +
                "  - template_item2\n" +
                "both:\n" +
                "  - template_value1\n" +
                "  - template_value2\n" +
                "---\n";
            const target_content =
                "---\n" +
                "only_in_target:\n" +
                "  - target_item1\n" +
                "  - target_item2\n" +
                "both:\n" +
                "  - target_value1\n" +
                "  - target_value2\n" +
                "---\n";
            const expected =
                "---\n" +
                "only_in_target:\n" +
                "  - target_item1\n" +
                "  - target_item2\n" +
                "both:\n" +
                "  - target_value1\n" +
                "  - target_value2\n" +
                "  - template_value1\n" +
                "  - template_value2\n" +
                "only_in_template:\n" +
                "  - template_item1\n" +
                "  - template_item2\n" +
                "---\n";
            const wait_cache = true;
            const actual = await t.run_in_new_leaf_and_get_output(
                template_content,
                target_content,
                wait_cache
            );
            expect(actual).to.equal(expected);
        }
    );

    t.test(
        "append_template_to_active_file preserves duplicate values in YAML lists that don't match",
        async () => {
            const template_content =
                "---\n" +
                "template_duplicates:\n" +
                "  - duplicate_value\n" +
                "  - duplicate_value\n" +
                "  - unique_value\n" +
                "---\n";
            const target_content =
                "---\n" +
                "target_duplicates:\n" +
                "  - another_duplicate\n" +
                "  - another_duplicate\n" +
                "  - another_unique\n" +
                "---\n";
            const expected =
                "---\n" +
                "target_duplicates:\n" +
                "  - another_duplicate\n" +
                "  - another_duplicate\n" +
                "  - another_unique\n" +
                "template_duplicates:\n" +
                "  - duplicate_value\n" +
                "  - duplicate_value\n" +
                "  - unique_value\n" +
                "---\n";
            const wait_cache = true;
            const actual = await t.run_in_new_leaf_and_get_output(
                template_content,
                target_content,
                wait_cache
            );
            expect(actual).to.equal(expected);
        }
    );

    t.test(
        "append_template_to_active_file de-duplicates duplicate values in matching YAML lists",
        async () => {
            const template_content =
                "---\n" +
                "duplicates_when_merged:\n" +
                "  - template_item\n" +
                "  - shared_item\n" +
                "duplicates_pre_merge:\n" +
                "  - template_item\n" +
                "  - template_item\n" +
                "duplicates_post_merge:\n" +
                "  - template_item\n" +
                "---\n";
            const target_content =
                "---\n" +
                "duplicates_when_merged:\n" +
                "  - target_item\n" +
                "  - shared_item\n" +
                "duplicates_pre_merge:\n" +
                "  - target_item\n" +
                "duplicates_post_merge:\n" +
                "  - target_item\n" +
                "  - target_item\n" +
                "---\n";
            const expected =
                "---\n" +
                "duplicates_when_merged:\n" +
                "  - target_item\n" +
                "  - shared_item\n" +
                "  - template_item\n" +
                "duplicates_pre_merge:\n" +
                "  - target_item\n" +
                "  - template_item\n" +
                "duplicates_post_merge:\n" +
                "  - target_item\n" +
                "  - template_item\n" +
                "---\n";
            const wait_cache = true;
            const actual = await t.run_in_new_leaf_and_get_output(
                template_content,
                target_content,
                wait_cache
            );
            expect(actual).to.equal(expected);
        }
    );

    t.test(
        "append_template_to_active_file handles mixed data types for same key",
        async () => {
            const template_content =
                "---\n" +
                "string_to_list:\n" +
                "  - template_item1\n" +
                "  - template_item2\n" +
                "list_to_string: template string\n" +
                "string_to_number: 42\n" +
                "list_to_boolean: true\n" +
                "---\n";
            const target_content =
                "---\n" +
                "string_to_list: target string\n" +
                "list_to_string:\n" +
                "  - target_item1\n" +
                "  - target_item2\n" +
                "string_to_number: existing string\n" +
                "list_to_boolean:\n" +
                "  - existing_item\n" +
                "---\n";
            const expected =
                "---\n" +
                "string_to_list:\n" +
                "  - template_item1\n" +
                "  - template_item2\n" +
                "list_to_string: template string\n" +
                "string_to_number: 42\n" +
                "list_to_boolean: true\n" +
                "---\n";
            const wait_cache = true;
            const actual = await t.run_in_new_leaf_and_get_output(
                template_content,
                target_content,
                wait_cache
            );
            expect(actual).to.equal(expected);
        }
    );
}
