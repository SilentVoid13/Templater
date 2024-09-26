import { Plugin, TAbstractFile, TFile, TFolder } from "obsidian";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

import { RunMode, RunningConfig } from "core/Templater";
import TemplaterPlugin from "main";
import {
    cache_update,
    delay,
    PLUGIN_NAME,
    TARGET_FILE_NAME,
    TEMPLATE_FILE_NAME,
} from "./utils.test";
import { InternalModuleFileTests } from "./InternalTemplates/InternalModuleFile.test";
import { InternalModuleDateTests } from "./InternalTemplates/InternalModuleDate.test";
import { InternalModuleFrontmatterTests } from "./InternalTemplates/InternalModuleFrontmatter.test";
import { InternalModuleHooksTests } from "./InternalTemplates/InternalModuleHooks.test";
import { InternalModuleSystemTests } from "./InternalTemplates/InternalModuleSystem.test";
import { InternalModuleConfigTests } from "./InternalTemplates/InternalModuleConfig.test";
import { TemplaterTests } from "./Templater.test";

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
        InternalModuleHooksTests(this);
        InternalModuleSystemTests(this);
        InternalModuleConfigTests(this);
        TemplaterTests(this);
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

    async create_new_note_from_template_and_get_output(
        template_content: string,
        delay_ms = 300
    ): Promise<string | undefined> {
        const file = await this.plugin.templater.create_new_note_from_template(
            template_content
        );
        if (file) {
            this.active_files.push(file);
            await delay(delay_ms);
            const content = await this.app.vault.read(file);
            return content;
        }
    }

    async run_in_new_leaf(
        template_content: string,
        target_content = "",
        waitCache = false,
        skip_modify = false
    ): Promise<void> {
        await this.app.vault.modify(this.template_file, template_content);
        if (!skip_modify) {
            await this.app.vault.modify(this.target_file, target_content);
        }
        if (waitCache) {
            await cache_update(this);
        }

        await this.app.workspace.getLeaf(true).openFile(this.target_file);

        await this.plugin.templater.append_template_to_active_file(
            this.template_file
        );

        await delay(300);
    }
}
