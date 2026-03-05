import { expect } from "chai";
import TestTemplaterPlugin from "./main.test";

export function CommandHandlerTests(t: TestTemplaterPlugin) {
    t.test("create_new_note_from_template creates file with processed content", async () => {
        const template = await t.createFile("TestTemplate.md", "# <% tp.file.title %>");

        const created = await t.plugin.templater.create_new_note_from_template(
            template,
            undefined,
            "CLITestNote",
            false
        );

        expect(created).to.not.be.undefined;
        expect(created).to.not.be.null;
        expect(created?.name).to.equal("CLITestNote.md");

        if (created) {
            const content = await t.app.vault.read(created);
            expect(content).to.equal("# CLITestNote");
            t.active_files.push(created);
        }
    });

    t.test("create_new_note_from_template auto-increments filename on conflict", async () => {
        const template = await t.createFile("TestTemplate2.md", "Test content");

        const first = await t.plugin.templater.create_new_note_from_template(
            template,
            undefined,
            "ConflictTest",
            false
        );
        if (first) {
            t.active_files.push(first);
        }

        const second = await t.plugin.templater.create_new_note_from_template(
            template,
            undefined,
            "ConflictTest",
            false
        );
        if (second) {
            t.active_files.push(second);
        }

        expect(first?.name).to.equal("ConflictTest.md");
        expect(second?.name).to.equal("ConflictTest 1.md");
    });

    t.test("create_new_note_from_template creates file in folder", async () => {
        const template = await t.createFile("TestTemplate3.md", "Folder test");
        const folder = await t.createFolder("CLITestFolder");

        const created = await t.plugin.templater.create_new_note_from_template(
            template,
            folder,
            "FolderNote",
            false
        );

        expect(created).to.not.be.undefined;
        expect(created?.path).to.equal("CLITestFolder/FolderNote.md");

        if (created) {
            t.active_files.push(created);
        }
    });

    t.test("create_new_note_from_template processes frontmatter", async () => {
        const templateContent = `---
title: "<% tp.file.title %>"
---
# <% tp.file.title %>`;
        const template = await t.createFile("TestTemplate4.md", templateContent);

        const created = await t.plugin.templater.create_new_note_from_template(
            template,
            undefined,
            "FrontmatterTest",
            false
        );

        expect(created).to.not.be.undefined;

        if (created) {
            const content = await t.app.vault.read(created);
            expect(content).to.include('title: "FrontmatterTest"');
            expect(content).to.include("# FrontmatterTest");
            t.active_files.push(created);
        }
    });

    t.test("create_new_note_from_template with string content", async () => {
        const templateContent = "# <% tp.file.title %>\nCreated via string";

        const created = await t.plugin.templater.create_new_note_from_template(
            templateContent,
            undefined,
            "StringTest",
            false
        );

        expect(created).to.not.be.undefined;
        expect(created?.name).to.equal("StringTest.md");

        if (created) {
            const content = await t.app.vault.read(created);
            expect(content).to.equal("# StringTest\nCreated via string");
            t.active_files.push(created);
        }
    });
}
