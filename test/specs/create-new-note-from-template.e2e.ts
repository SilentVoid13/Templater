import { resetWorkspace } from "../helpers/obsidianTestHelpers";
import {
    createNewNoteFromTemplate,
    deleteVaultPath,
    uniqueTestName,
} from "../helpers/templaterCommandTestHelpers";

describe("create_new_note_from_template", () => {
    const cleanupPaths: string[] = [];

    beforeEach(async () => {
        cleanupPaths.length = 0;
        await resetWorkspace();
    });

    afterEach(async () => {
        for (const path of cleanupPaths.reverse()) {
            await deleteVaultPath(path);
        }
    });

    it("creates file with processed content", async () => {
        const baseName = uniqueTestName("wdio-template-create");
        const templatePath = `${baseName}-template.md`;
        const noteName = `${baseName}-note`;

        cleanupPaths.push(templatePath);

        const created = await createNewNoteFromTemplate({
            templateContent: "# <% tp.file.title %>",
            filename: noteName,
            templatePath,
            useTemplateFile: true,
        });

        expect(created).not.toBeNull();
        expect(created?.name).toBe(`${noteName}.md`);
        expect(created?.content).toBe(`# ${noteName}`);

        if (created) {
            cleanupPaths.push(created.path);
        }
    });

    it("auto-increments filename on conflict", async () => {
        const baseName = uniqueTestName("wdio-template-conflict");
        const templatePath = `${baseName}-template.md`;

        cleanupPaths.push(templatePath);

        const first = await createNewNoteFromTemplate({
            templateContent: "Test content",
            filename: baseName,
            templatePath,
            useTemplateFile: true,
        });

        const second = await createNewNoteFromTemplate({
            templateContent: "Test content",
            filename: baseName,
            templatePath,
            useTemplateFile: true,
        });

        expect(first).not.toBeNull();
        expect(second).not.toBeNull();
        expect(first?.name).toBe(`${baseName}.md`);
        expect(second?.name).toBe(`${baseName} 1.md`);

        if (first) {
            cleanupPaths.push(first.path);
        }
        if (second) {
            cleanupPaths.push(second.path);
        }
    });

    it("creates file in the requested folder", async () => {
        const baseName = uniqueTestName("wdio-template-folder");
        const templatePath = `${baseName}-template.md`;
        const folderPath = `${baseName}-folder`;
        const noteName = `${baseName}-note`;

        cleanupPaths.push(templatePath, folderPath);

        const created = await createNewNoteFromTemplate({
            templateContent: "Folder test",
            filename: noteName,
            folderPath,
            templatePath,
            useTemplateFile: true,
        });

        expect(created).not.toBeNull();
        expect(created?.path).toBe(`${folderPath}/${noteName}.md`);

        if (created) {
            cleanupPaths.push(created.path);
        }
    });

    it("processes frontmatter and body", async () => {
        const baseName = uniqueTestName("wdio-template-frontmatter");
        const templatePath = `${baseName}-template.md`;
        const noteName = `${baseName}-note`;

        cleanupPaths.push(templatePath);

        const templateContent = `---\ntitle: "<% tp.file.title %>"\n---\n# <% tp.file.title %>`;

        const created = await createNewNoteFromTemplate({
            templateContent,
            filename: noteName,
            templatePath,
            useTemplateFile: true,
        });

        expect(created).not.toBeNull();
        expect(created?.content).toContain(`title: "${noteName}"`);
        expect(created?.content).toContain(`# ${noteName}`);

        if (created) {
            cleanupPaths.push(created.path);
        }
    });

    it("supports string template content", async () => {
        const noteName = uniqueTestName("wdio-template-string");

        const created = await createNewNoteFromTemplate({
            templateContent: "# <% tp.file.title %>\nCreated via string",
            filename: noteName,
            useTemplateFile: false,
        });

        expect(created).not.toBeNull();
        expect(created?.name).toBe(`${noteName}.md`);
        expect(created?.content).toBe(`# ${noteName}\nCreated via string`);

        if (created) {
            cleanupPaths.push(created.path);
        }
    });
});
