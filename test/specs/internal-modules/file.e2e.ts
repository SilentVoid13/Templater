import { browser } from "@wdio/globals";
import { resetWorkspace } from "../../helpers/obsidianTestHelpers";
import {
    createOrUpdateVaultFile,
    deleteVaultPath,
    getFileTimes,
    runAndGetOutput,
    setFileTimes,
    uniqueTestName,
} from "../../helpers/legacyTemplaterTestHelpers";

describe("InternalModuleFile", () => {
    const cleanupPaths: string[] = [];
    const fixedTimestamp = 1619852400000;

    const addCleanup = (...paths: string[]) => {
        cleanupPaths.push(...paths);
    };

    const formatLocalDateTime = (timestamp: number): string => {
        const date = new Date(timestamp);
        const pad = (value: number) => String(value).padStart(2, "0");
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    beforeEach(async () => {
        cleanupPaths.length = 0;
        await resetWorkspace();
    });

    afterEach(async () => {
        for (const path of cleanupPaths.reverse()) {
            await deleteVaultPath(path);
        }
    });

    it("tp.file.content", async () => {
        const baseName = uniqueTestName("wdio-file-content");
        const targetPath = `${baseName}-target.md`;
        const templatePath = `${baseName}-template.md`;
        addCleanup(targetPath, templatePath);

        const targetContent =
            "This is some content\r\nWith \tsome newlines\n\n";
        const output = await runAndGetOutput({
            templatePath,
            targetPath,
            templateContent: "<% tp.file.content %>",
            targetContent,
        });

        expect(output).toBe(targetContent);
    });

    it.skip("tp.file.create_new", async () => {
        // Legacy test is TODO.
    });

    it("tp.file.creation_date", async () => {
        const baseName = uniqueTestName("wdio-file-creation-date");
        const targetPath = `${baseName}-target.md`;
        const templatePath = `${baseName}-template.md`;
        addCleanup(targetPath, templatePath);

        await createOrUpdateVaultFile(targetPath, "");

        const original = await getFileTimes(targetPath);
        await setFileTimes(targetPath, { ctime: fixedTimestamp });

        const defaultFormat = await runAndGetOutput({
            templatePath,
            targetPath,
            templateContent: "Creation date: <% tp.file.creation_date() %>\n\n",
            skipTargetModify: true,
        });
        expect(defaultFormat).toBe(
            `Creation date: ${formatLocalDateTime(fixedTimestamp)}\n\n`,
        );

        const customFormat = await runAndGetOutput({
            templatePath,
            targetPath,
            templateContent:
                'Creation date: <% tp.file.creation_date("dddd Do MMMM YYYY, ddd") %>\n\n',
            skipTargetModify: true,
        });
        expect(customFormat).toBe(
            "Creation date: Saturday 1st May 2021, Sat\n\n",
        );

        await setFileTimes(targetPath, { ctime: original.ctime });
    });

    it("tp.file.cursor", async () => {
        const baseName = uniqueTestName("wdio-file-cursor");
        const targetPath = `${baseName}-target.md`;
        const templatePath = `${baseName}-template.md`;
        addCleanup(targetPath, templatePath);

        const output = await runAndGetOutput({
            templatePath,
            targetPath,
            templateContent: "Cursor: <%\t\ntp.file.cursor(10)\t\r\n%>\n\n",
            targetContent: "",
        });

        expect(output).toBe("Cursor: <% tp.file.cursor(10) %>\n\n");
    });

    it.skip("tp.file.cursor_append", async () => {
        // Legacy test is TODO.
    });

    it("tp.file.exists", async () => {
        const baseName = uniqueTestName("wdio-file-exists");
        const targetPath = `${baseName}-target.md`;
        const templatePath = `${baseName}-template.md`;
        const targetName = `${baseName}-target.md`;
        addCleanup(targetPath, templatePath);

        const outputExists = await runAndGetOutput({
            templatePath,
            targetPath,
            templateContent: `File Exists: <% tp.file.exists("${targetName}") %>\n\n`,
            targetContent: "",
        });
        expect(outputExists).toBe("File Exists: true\n\n");

        const outputMissing = await runAndGetOutput({
            templatePath,
            targetPath,
            templateContent:
                'File Exists: <% tp.file.exists("NonExistingFile.md") %>\n\n',
            targetContent: "",
        });
        expect(outputMissing).toBe("File Exists: false\n\n");
    });

    it("tp.file.find_tfile", async () => {
        const baseName = uniqueTestName("wdio-file-find-tfile");
        const targetPath = `${baseName}-target.md`;
        const templatePath = `${baseName}-template.md`;
        const targetBasename = `${baseName}-target`;
        addCleanup(targetPath, templatePath);

        const outputFound = await runAndGetOutput({
            templatePath,
            targetPath,
            templateContent: `File: <% tp.file.find_tfile("${targetBasename}").path %>\n\n`,
            targetContent: "",
        });
        expect(outputFound).toBe(`File: ${targetPath}\n\n`);

        const outputMissing = await runAndGetOutput({
            templatePath,
            targetPath,
            templateContent:
                'File: <% tp.file.find_tfile("NonExistingFile") %>\n\n',
            targetContent: "",
        });
        expect(outputMissing).toBe("File: null\n\n");
    });

    it("tp.file.folder", async () => {
        const baseName = uniqueTestName("wdio-file-folder");
        const targetPath = `${baseName}-target.md`;
        const templatePath = `${baseName}-template.md`;
        addCleanup(targetPath, templatePath);

        const output = await runAndGetOutput({
            templatePath,
            targetPath,
            templateContent:
                "Folder: <% tp.file.folder() %>\n\nFolder: <% tp.file.folder(true) %>\n\n",
            targetContent: "",
        });

        expect(output).toBe("Folder: \n\nFolder: /\n\n");
    });

    it("tp.file.include", async () => {
        const baseName = uniqueTestName("wdio-file-include");
        const targetPath = `${baseName}-target.md`;
        const templatePath = `${baseName}-template.md`;
        const inc1 = `${baseName}-Inc1.md`;
        const inc2 = `${baseName}-Inc2.md`;
        const inc3 = `${baseName}-Inc3.md`;
        const inc1Base = `${baseName}-Inc1`;
        const inc2Base = `${baseName}-Inc2`;
        const inc3Base = `${baseName}-Inc3`;
        addCleanup(targetPath, templatePath, inc1, inc2, inc3);

        await createOrUpdateVaultFile(
            inc1,
            `Inc1 content\n<% tp.file.include('[[${inc2Base}]]') %>\n\n`,
        );
        await createOrUpdateVaultFile(inc2, "Inc2 content\n\n");
        await createOrUpdateVaultFile(
            inc3,
            `Inc3 content\n<% tp.file.include('[[${inc3Base}]]') %>\n\n`,
        );

        const includeNestedOutput = await runAndGetOutput({
            templatePath,
            targetPath,
            templateContent: `Included: <% tp.file.include('[[${inc1Base}]]') %>\n\n`,
            targetContent: "",
        });
        expect(includeNestedOutput).toBe(
            "Included: Inc1 content\nInc2 content\n\n\n\n\n\n",
        );

        const includeSimpleOutput = await runAndGetOutput({
            templatePath,
            targetPath,
            templateContent: `Included: <% tp.file.include('[[${inc2Base}]]') %>\n\n`,
            targetContent: "",
        });
        expect(includeSimpleOutput).toBe("Included: Inc2 content\n\n\n\n");

        await expect(
            runAndGetOutput({
                templatePath,
                targetPath,
                templateContent: `Included: <% tp.file.include('[[${inc3Base}]]') %>\n\n`,
                targetContent: "",
            }),
        ).rejects.toThrow("Reached inclusion depth limit (max = 10)");

        await expect(
            runAndGetOutput({
                templatePath,
                targetPath,
                templateContent: `Included: <% tp.file.include('${inc3Base}') %>\n\n`,
                targetContent: "",
            }),
        ).rejects.toThrow(
            "Invalid file format, provide an obsidian link between quotes.",
        );

        await expect(
            runAndGetOutput({
                templatePath,
                targetPath,
                templateContent:
                    "Included: <% tp.file.include('[[NonExistingFile]]') %>\n\n",
                targetContent: "",
            }),
        ).rejects.toThrow("File [[NonExistingFile]] doesn't exist");
    });

    it("tp.file.last_modified_date", async () => {
        const baseName = uniqueTestName("wdio-file-last-modified-date");
        const targetPath = `${baseName}-target.md`;
        const templatePath = `${baseName}-template.md`;
        addCleanup(targetPath, templatePath);

        await createOrUpdateVaultFile(targetPath, "");

        const original = await getFileTimes(targetPath);
        await setFileTimes(targetPath, { mtime: fixedTimestamp });

        const defaultFormat = await runAndGetOutput({
            templatePath,
            targetPath,
            templateContent:
                "Last modif date: <% tp.file.last_modified_date() %>\n\n",
            skipTargetModify: true,
        });
        expect(defaultFormat).toBe(
            `Last modif date: ${formatLocalDateTime(fixedTimestamp)}\n\n`,
        );

        const customFormat = await runAndGetOutput({
            templatePath,
            targetPath,
            templateContent:
                'Last modif date: <% tp.file.last_modified_date("dddd Do MMMM YYYY, ddd") %>\n\n',
            skipTargetModify: true,
        });
        expect(customFormat).toBe(
            "Last modif date: Saturday 1st May 2021, Sat\n\n",
        );

        await setFileTimes(targetPath, { mtime: original.mtime });
    });

    it("tp.file.move", async () => {
        const baseName = uniqueTestName("wdio-file-move");
        const targetPath = `${baseName}-target.md`;
        const templatePath = `${baseName}-template.md`;
        const folderPath = `${baseName}-folder`;
        const nestedPath = `${folderPath}/nested`;
        const file1Path = `${baseName}-File1.md`;
        const nested1Path = `${baseName}-Nested1.md`;
        addCleanup(
            targetPath,
            templatePath,
            folderPath,
            file1Path,
            nested1Path,
        );

        await createOrUpdateVaultFile(file1Path, "");
        await createOrUpdateVaultFile(nested1Path, "");

        const firstOutput = await runAndGetOutput({
            templatePath,
            targetPath: file1Path,
            templateContent: `Move <% tp.file.move("${folderPath}/File2") %>\n\n`,
            skipTargetModify: true,
        });
        expect(firstOutput).toBe("Move \n\n");

        const firstMovedPath = `${folderPath}/File2.md`;
        const firstExists = await browser.executeObsidian(
            ({ app }, path: string) => !!app.vault.getFileByPath(path),
            firstMovedPath,
        );
        expect(firstExists).toBe(true);

        const secondOutput = await runAndGetOutput({
            templatePath,
            targetPath: nested1Path,
            templateContent: `Move <% tp.file.move("${nestedPath}/Nested2") %>\n\n`,
            skipTargetModify: true,
        });
        expect(secondOutput).toBe("Move \n\n");

        const secondMovedPath = `${nestedPath}/Nested2.md`;
        const secondExists = await browser.executeObsidian(
            ({ app }, path: string) => !!app.vault.getFileByPath(path),
            secondMovedPath,
        );
        expect(secondExists).toBe(true);
    });

    it("tp.file.path", async () => {
        const baseName = uniqueTestName("wdio-file-path");
        const targetPath = `${baseName}-target.md`;
        const templatePath = `${baseName}-template.md`;
        addCleanup(targetPath, templatePath);

        const output = await runAndGetOutput({
            templatePath,
            targetPath,
            templateContent: "Path: <% tp.file.path(true) %>\n\n",
            targetContent: "",
        });

        expect(output).toBe(`Path: ${targetPath}\n\n`);
    });

    it("tp.file.rename", async () => {
        const baseName = uniqueTestName("wdio-file-rename");
        const templatePath = `${baseName}-template.md`;
        const initialPath = `${baseName}-File1.md`;
        const renamedPath = `${baseName}-File2.md`;
        addCleanup(templatePath, initialPath, renamedPath);

        await createOrUpdateVaultFile(initialPath, "");

        const renameOutput = await runAndGetOutput({
            templatePath,
            targetPath: initialPath,
            templateContent: `Rename <% tp.file.rename("${baseName}-File2") %>\n\n`,
            skipTargetModify: true,
        });
        expect(renameOutput).toBe("Rename \n\n");

        const renamedExists = await browser.executeObsidian(
            ({ app }, path: string) => !!app.vault.getFileByPath(path),
            renamedPath,
        );
        expect(renamedExists).toBe(true);

        await expect(
            runAndGetOutput({
                templatePath,
                targetPath: renamedPath,
                templateContent:
                    'Rename <% tp.file.rename("Fail/File2.md") %>\n\n',
                skipTargetModify: true,
            }),
        ).rejects.toThrow(
            "File name cannot contain any of these characters: \\ / :",
        );
    });

    it.skip("tp.file.selection", async () => {
        // Legacy test is TODO.
    });

    it("tp.file.tags", async () => {
        const baseName = uniqueTestName("wdio-file-tags");
        const targetPath = `${baseName}-target.md`;
        const templatePath = `${baseName}-template.md`;
        addCleanup(targetPath, templatePath);

        await createOrUpdateVaultFile(targetPath, "#tag1\n#tag2\n#tag3\n\n");
        await browser.executeObsidian(async ({ app }, path: string) => {
            const file = app.vault.getFileByPath(path);
            if (!file) {
                return;
            }

            for (let i = 0; i < 20; i += 1) {
                const cache = app.metadataCache.getFileCache(file);
                if (cache?.tags?.length) {
                    return;
                }
                await new Promise((resolve) =>
                    activeWindow.setTimeout(resolve, 50),
                );
            }
        }, targetPath);

        const output = await runAndGetOutput({
            templatePath,
            targetPath,
            templateContent: "Tags: <% tp.file.tags %>\n\n",
            skipTargetModify: true,
        });

        expect(output).toBe("Tags: #tag1,#tag2,#tag3\n\n");
    });

    it("tp.file.title", async () => {
        const baseName = uniqueTestName("wdio-file-title");
        const targetPath = `${baseName}-target.md`;
        const templatePath = `${baseName}-template.md`;
        addCleanup(targetPath, templatePath);

        const output = await runAndGetOutput({
            templatePath,
            targetPath,
            templateContent: "Title: <% tp.file.title %>\n\n",
            targetContent: "",
        });

        expect(output).toBe(`Title: ${baseName}-target\n\n`);
    });
});
