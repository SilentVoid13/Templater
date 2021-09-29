import { Plugin, TAbstractFile, TFile, TFolder } from "obsidian";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

import { RunMode, RunningConfig } from "Templater";
import TemplaterPlugin from "main";
import {
    cache_update,
    delay,
    PLUGIN_NAME,
    TARGET_FILE_NAME,
    TEMPLATE_FILE_NAME,
} from "./Util.test";
import { InternalModuleFileTests } from "./InternalTemplates/file/InternalModuleFile.test";
import { InternalModuleDateTests } from "./InternalTemplates/date/InternalModuleDate.test";
import { InternalModuleFrontmatterTests } from "./InternalTemplates/frontmatter/InternalModuleFrontmatter.test";
import { InternalModuleSystemTests } from "./InternalTemplates/system/InternalModuleSystem.test";
import { InternalModuleConfigTests } from "./InternalTemplates/config/InternalModuleConfig.test";

chai.use(chaiAsPromised);

export interface TestRunConfig {
    template_content: string;
    target_content: string;
    wait_cache: boolean;
    skip_template_modify: boolean;
    skip_target_modify: boolean;
}

export default class TestTemplaterPlugin extends Plugin {
    tests: Array<{ name: string; fn: () => Promise<void> }>;
    plugin: TemplaterPlugin;
    template_file: TFile;
    target_file: TFile;
    active_files: Array<TAbstractFile> = new Array();

    async onload() {
        this.addCommand({
            id: "run-templater-tests",
            name: "Run Templater Tests",
            callback: async () => {
                await this.setup();
                await this.load_tests();
                await this.run_tests();
                await this.teardown();
            },
        });
    }

    async setup() {
        await delay(300);
        this.tests = new Array();
        // @ts-ignore
        this.plugin = this.app.plugins.getPlugin(PLUGIN_NAME);
        this.plugin.settings.trigger_on_file_creation = false;
        this.plugin.event_handler.update_trigger_file_on_creation();
        this.target_file = await this.app.vault.create(
            `${TARGET_FILE_NAME}.md`,
            ""
        );
        this.template_file = await this.app.vault.create(
            `${TEMPLATE_FILE_NAME}.md`,
            ""
        );

        //await this.disable_external_plugins();
    }

    async teardown() {
        this.plugin.settings.trigger_on_file_creation = true;
        this.plugin.event_handler.update_trigger_file_on_creation();
        await this.cleanupFiles();
        await this.app.vault.delete(this.target_file, true);
        await this.app.vault.delete(this.template_file, true);

        //await this.enable_external_plugins();
    }

    async disable_external_plugins() {
        // @ts-ignore
        for (const plugin_name of Object.keys(this.app.plugins.plugins)) {
            if (
                plugin_name !== PLUGIN_NAME &&
                plugin_name !== this.manifest.id
            ) {
                // @ts-ignore
                await this.app.plugins.plugins[plugin_name].unload();
            }
        }
    }

    async enable_external_plugins() {
        // @ts-ignore
        for (const plugin_name of Object.keys(this.app.plugins.plugins)) {
            if (
                plugin_name !== PLUGIN_NAME &&
                plugin_name !== this.manifest.id
            ) {
                // @ts-ignore
                await this.app.plugins.plugins[plugin_name].load();
            }
        }
    }

    async load_tests() {
        InternalModuleFileTests(this);
        InternalModuleDateTests(this);
        InternalModuleFrontmatterTests(this);
        InternalModuleSystemTests(this);
        InternalModuleConfigTests(this);
    }

    test(name: string, fn: () => Promise<void>) {
        this.tests.push({ name, fn });
    }

    async run_tests() {
        for (let t of this.tests) {
            try {
                await t.fn();
                console.log("✅", t.name);
            } catch (e) {
                console.log("❌", t.name);
                console.error(e);
            }
        }
    }

    async cleanupFiles() {
        let file;
        while ((file = this.active_files.pop()) !== undefined) {
            try {
                await this.app.vault.delete(file, true);
            } catch (e) {}
        }
    }

    retrieveActiveFile(file_name: string): TAbstractFile {
        for (const file of this.active_files) {
            if (file.name === file_name) {
                return file;
            }
        }
        return null;
    }

    async createFolder(folder_name: string): Promise<TFolder> {
        let folder = this.retrieveActiveFile(folder_name);
        if (folder && folder instanceof TFolder) {
            return folder;
        }
        await this.app.vault.createFolder(folder_name);
        folder = this.app.vault.getAbstractFileByPath(folder_name);
        if (!(folder instanceof TFolder)) {
            return null;
        }
        this.active_files.push(folder);
        return folder;
    }

    async createFile(
        file_name: string,
        file_content: string = ""
    ): Promise<TFile> {
        const f = this.retrieveActiveFile(file_name);
        if (f && f instanceof TFile) {
            await this.app.vault.modify(f, file_content);
            return f;
        }
        const file = await this.app.vault.create(file_name, file_content);
        this.active_files.push(file);
        return file;
    }

    async run_and_get_output(
        template_content: string,
        target_content: string = "",
        waitCache: boolean = false,
        skip_modify: boolean = false
    ): Promise<string> {
        await this.app.vault.modify(this.template_file, template_content);
        if (!skip_modify) {
            await this.app.vault.modify(this.target_file, target_content);
        }
        if (waitCache) {
            await cache_update(this);
        }

        const running_config: RunningConfig = {
            template_file: this.template_file,
            target_file: this.target_file,
            run_mode: RunMode.OverwriteFile,
        };
        const content = await this.plugin.templater.read_and_parse_template(
            running_config
        );
        return content;
    }
}
