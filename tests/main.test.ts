import { Plugin, TFile } from "obsidian";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

import TemplaterPlugin from "../src/main";
import { cache_update, delay, PLUGIN_NAME, TARGET_FILE_NAME, TEMPLATE_FILE_NAME } from "./Util.test";
import { InternalModuleFileTests } from "./InternalTemplates/file/InternalModuleFile.test";
import { InternalModuleDateTests } from "./InternalTemplates/date/InternalModuleDate.test";
import { InternalModuleFrontmatterTests } from "./InternalTemplates/frontmatter/InternalModuleFrontmatter.test";
import { InternalModuleSystemTests } from "./InternalTemplates/system/InternalModuleSystem.test";
import { RunMode, RunningConfig } from "Templater";

chai.use(chaiAsPromised);

export default class TestTemplaterPlugin extends Plugin {
    tests: Array<{name: string, fn: (() => Promise<void>)}>;
    plugin: TemplaterPlugin;
    template_file: TFile;
    target_file: TFile;
    test_file: TFile;

    async onload() {
        this.addCommand({
			id: "run-templater-tests",
			name: "Run Templater Tests",
			hotkeys: [
				{
					modifiers: ["Alt"],
					key: 't',
				},
			],
			callback: async () => {
                await this.setup();
                await this.load_tests();
                await this.run_tests();
                await this.teardown();
			},
		});
    }

    async setup() {
        this.tests = new Array();
        // @ts-ignore
        this.plugin = this.app.plugins.getPlugin(PLUGIN_NAME);
        this.plugin.settings.trigger_on_file_creation = false;
        this.plugin.update_trigger_file_on_creation();
        this.target_file = await this.app.vault.create(`${TARGET_FILE_NAME}.md`, "");
        this.template_file = await this.app.vault.create(`${TEMPLATE_FILE_NAME}.md`, "");
    }

    async teardown() {
        this.plugin.settings.trigger_on_file_creation = true;
        this.plugin.update_trigger_file_on_creation();
        await this.app.vault.delete(this.target_file, true);
        await this.app.vault.delete(this.template_file, true);
    }

    async load_tests() {
        InternalModuleFileTests(this);
        InternalModuleDateTests(this);
        InternalModuleFrontmatterTests(this);
        InternalModuleSystemTests(this);
    }

    test(name: string, fn: () => Promise<void>) {
        this.tests.push({name, fn});
    }

    async run_tests() {
        for (let t of this.tests) {
            try {
                await t.fn();
                console.log("✅", t.name)
            } catch(e) {
                console.log("❌", t.name);
                console.error(e);
            }
        }
    }

    async run_and_get_output(template_content: string, target_content: string = "", waitCache: boolean = false): Promise<string> {
        await this.app.vault.modify(this.template_file, template_content);
        await this.app.vault.modify(this.target_file, target_content);
        if (waitCache) {
            await cache_update(this);
        }

        const running_config: RunningConfig = {
            template_file: this.template_file,
            target_file: this.target_file,
            run_mode: RunMode.OverwriteFile,
        };
        const content = await this.plugin.templater.read_and_parse_template(running_config);
        return content;
    }
}