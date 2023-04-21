import TestTemplaterPlugin from "../main.test";
import { TARGET_FILE_NAME } from "../utils.test";
import { expect } from "chai";

export function InternalModuleFileTests(t: TestTemplaterPlugin) {
    t.test("tp.file.content", async () => {
        const target_file_content =
            "This is some content\r\nWith \tsome newlines\n\n";
        await expect(
            t.run_and_get_output(`<% tp.file.content %>`, target_file_content)
        ).to.eventually.equal(target_file_content);
    });

    t.test("tp.file.create_new", async () => {
        // TODO
    });

    t.test("tp.file.creation_date", async () => {
        const saved_ctime = t.target_file.stat.ctime;
        // 2021-05-01 00:00:00
        t.target_file.stat.ctime = 1619820000000;

        await expect(
            t.run_and_get_output(
                `Creation date: <% tp.file.creation_date() %>\n\n`,
                "",
                false,
                true
            )
        ).to.eventually.equal("Creation date: 2021-05-01 00:00\n\n");
        await expect(
            t.run_and_get_output(
                `Creation date: <% tp.file.creation_date("dddd Do MMMM YYYY, ddd") %>\n\n`,
                "",
                false,
                true
            )
        ).to.eventually.equal("Creation date: Saturday 1st May 2021, Sat\n\n");

        t.target_file.stat.ctime = saved_ctime;
    });

    t.test("tp.file.cursor", async () => {
        await expect(
            t.run_and_get_output(
                `Cursor: <%\t\ntp.file.cursor(10)\t\r\n%>\n\n`,
                ""
            )
        ).to.eventually.equal(`Cursor: <% tp.file.cursor(10) %>\n\n`);
    });

    t.test("tp.file.cursor_append", async () => {
        // TODO
        //await expect(t.run_and_get_output(`Cursor append: <% tp.file.cursor_append("TestTest") %>\n\n`)).to.eventually.equal(`TestTest Cursor append: \n\n`);
    });

    t.test("tp.file.exists", async () => {
        await expect(
            t.run_and_get_output(
                `File Exists: <% tp.file.exists("${t.target_file.basename}.md") %>\n\n`
            )
        ).to.eventually.equal(`File Exists: true\n\n`);

        await expect(
            t.run_and_get_output(
                `File Exists: <% tp.file.exists("NonExistingFile.md") %>\n\n`
            )
        ).to.eventually.equal(`File Exists: false\n\n`);
    });

    t.test("tp.file.find_tfile", async () => {
        await expect(
            t.run_and_get_output(
                `File: <% tp.file.find_tfile("${t.target_file.basename}").path %>\n\n`
            )
        ).to.eventually.equal(`File: ${t.target_file.path}\n\n`);
        await expect(
            t.run_and_get_output(
                `File: <% tp.file.find_tfile("NonExistingFile") %>\n\n`
            )
        ).to.eventually.equal(`File: null\n\n`);
    });

    t.test("tp.file.folder", async () => {
        await expect(
            t.run_and_get_output(`Folder: <% tp.file.folder() %>\n\n`)
        ).to.eventually.equal(`Folder: \n\n`);
        await expect(
            t.run_and_get_output(`Folder: <% tp.file.folder(true) %>\n\n`)
        ).to.eventually.equal(`Folder: /\n\n`);
    });

    t.test("tp.file.include", async () => {
        await t.createFile(
            `Inc1.md`,
            `Inc1 content\n<% tp.file.include('[[Inc2]]') %>\n\n`
        );
        await t.createFile(`Inc2.md`, `Inc2 content\n\n`);
        await t.createFile(
            `Inc3.md`,
            `Inc3 content\n<% tp.file.include('[[Inc3]]') %>\n\n`
        );

        await expect(
            t.run_and_get_output(
                `Included: <% tp.file.include('[[Inc1]]') %>\n\n`
            )
        ).to.eventually.equal(
            `Included: Inc1 content\nInc2 content\n\n\n\n\n\n`
        );
        await expect(
            t.run_and_get_output(
                `Included: <% tp.file.include('[[Inc2]]') %>\n\n`
            )
        ).to.eventually.equal(`Included: Inc2 content\n\n\n\n`);

        await expect(
            t.run_and_get_output(
                `Included: <% tp.file.include('[[Inc3]]') %>\n\n`
            )
        ).to.eventually.be.rejectedWith(
            Error,
            "Reached inclusion depth limit (max = 10)"
        );
        await expect(
            t.run_and_get_output(`Included: <% tp.file.include('Inc3') %>\n\n`)
        ).to.eventually.be.rejectedWith(
            Error,
            "Invalid file format, provide an obsidian link between quotes."
        );
        await expect(
            t.run_and_get_output(
                `Included: <% tp.file.include('[[NonExistingFile]]') %>\n\n`
            )
        ).to.eventually.be.rejectedWith(
            Error,
            "File [[NonExistingFile]] doesn't exist"
        );
    });

    t.test("tp.file.last_modified_date", async () => {
        const saved_mtime = t.target_file.stat.mtime;
        // 2021-05-01 00:00:00
        t.target_file.stat.mtime = 1619820000000;

        expect(
            await t.run_and_get_output(
                `Last modif date: <% tp.file.last_modified_date() %>\n\n`,
                "",
                false,
                true
            )
        ).to.equal("Last modif date: 2021-05-01 00:00\n\n");
        expect(
            await t.run_and_get_output(
                `Last modif date: <% tp.file.last_modified_date("dddd Do MMMM YYYY, ddd") %>\n\n`,
                "",
                false,
                true
            )
        ).to.equal("Last modif date: Saturday 1st May 2021, Sat\n\n");

        t.target_file.stat.ctime = saved_mtime;
    });

    t.test("tp.file.move", async () => {
        const saved_target_file = t.target_file;
        const folder_name = `TestFolder`;
        const nested_name = `TestFolder/nested`;
        const folder = await t.createFolder(folder_name);
        const file1 = await t.createFile(`File1.md`);
        const nested1 = await t.createFile(`Nested1.md`);
        
        t.target_file = file1;
        await expect(
            t.run_and_get_output(
                `Move <% tp.file.move("${folder_name}/File2") %>\n\n`
            )
        ).to.eventually.equal(`Move \n\n`);
        expect(file1.path).to.equal(`${folder_name}/File2.md`);

        t.target_file = nested1;
        await expect(
            t.run_and_get_output(
                `Move <% tp.file.move("${nested_name}/Nested2") %>\n\n`
            )
        ).to.eventually.equal(`Move \n\n`);
        expect(nested1.path).to.equal(`${nested_name}/Nested2.md`);

        t.target_file = saved_target_file;
        await t.app.vault.delete(folder, true);
    });

    t.test("tp.file.path", async () => {
        // TODO

        //expect(await t.run_and_get_output("Path: <% tp.file.path(true) %>\n\n")).to.equal(`Path: ${TEMPLATE_FILE_NAME}\n\n`);
        await expect(
            t.run_and_get_output(`Path: <% tp.file.path(true) %>\n\n`)
        ).to.eventually.equal(`Path: ${TARGET_FILE_NAME}.md\n\n`);
    });

    t.test("tp.file.rename", async () => {
        const saved_target_file = t.target_file;
        const file1 = await t.createFile(`File1.md`);
        t.target_file = file1;

        await expect(
            t.run_and_get_output(`Rename <% tp.file.rename("File2") %>\n\n`)
        ).to.eventually.equal(`Rename \n\n`);
        expect(file1.basename).to.equal("File2");
        await expect(
            t.run_and_get_output(
                `Rename <% tp.file.rename("Fail/File2.md") %>\n\n`
            )
        ).to.eventually.be.rejectedWith(
            Error,
            "File name cannot contain any of these characters: \\ / :"
        );

        t.target_file = saved_target_file;
        await t.app.vault.delete(file1);
    });

    t.test("tp.file.selection", async () => {
        // TODO
    });

    t.test("tp.file.tags", async () => {
        await expect(
            t.run_and_get_output(
                `Tags: <% tp.file.tags %>\n\n`,
                `#tag1\n#tag2\n#tag3\n\n`,
                true
            )
        ).to.eventually.equal(`Tags: #tag1,#tag2,#tag3\n\n`);
    });

    t.test("tp.file.title", async () => {
        await expect(
            t.run_and_get_output(`Title: <% tp.file.title %>\n\n`)
        ).to.eventually.equal(`Title: ${TARGET_FILE_NAME}\n\n`);
    });
}
