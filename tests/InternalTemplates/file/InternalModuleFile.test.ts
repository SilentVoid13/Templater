import TestTemplaterPlugin from "../../main.test";
import { cache_update, TARGET_FILE_NAME, TEMPLATE_FILE_NAME } from "../../Util.test";
import { expect } from "chai";

export function InternalModuleFileTests(t: TestTemplaterPlugin) {
    t.test("tp.file.content", async () => {
        const target_file_content = "This is some content\r\nWith \tsome newlines\n\n";
        await expect(t.run_and_get_output(`<% tp.file.content %>`, target_file_content)).to.eventually.equal(target_file_content);
    });

    t.test("tp.file.creation_date", async() => {
        // TODO
        /*
        console.log("ctime:", t.target_file.stat.ctime);
        // 2021-04-29 10:00:00 EDT
        await t.app.vault.modify(t.target_file, "", {ctime: 1619704800});
        console.log("ctime:", t.target_file.stat.ctime);

        expect(await t.run_and_get_output(`Creation date: <% tp.file.creation_date() %>\n\n`, ""))
            .to.equal("Creation date: 2021-04-29 10:00\n\n");
        expect(await t.run_and_get_output(`Creation date: <% tp.file.creation_date("dddd Do MMMM YYYY, ddd") %>\n\n`, ""))
            .to.equal("Creation date: Thursday 29th April 2021, Thu");
        */
    });

    t.test("tp.file.folder", async () => {
        await expect(t.run_and_get_output(`Folder: <% tp.file.folder() %>\n\n`)).to.eventually.equal(`Folder: \n\n`);
        await expect(t.run_and_get_output(`Folder: <% tp.file.folder(true) %>\n\n`)).to.eventually.equal(`Folder: /\n\n`);
    });

    t.test("tp.file.include", async () => {
        const inc_file1 = await t.app.vault.create(`Inc1.md`, `Inc1 content\n<% tp.file.include('[[Inc2]]') %>\n\n`);
        const inc_file2 = await t.app.vault.create(`Inc2.md`, `Inc2 content\n\n`);
        const inc_file3 = await t.app.vault.create(`Inc3.md`, `Inc3 content\n<% tp.file.include('[[Inc3]]') %>\n\n`);

        await expect(t.run_and_get_output(`Included: <% tp.file.include('[[Inc1]]') %>\n\n`)).to.eventually.equal(`Included: Inc1 content\nInc2 content\n\n\n\n\n\n`);
        await expect(t.run_and_get_output(`Included: <% tp.file.include('[[Inc2]]') %>\n\n`)).to.eventually.equal(`Included: Inc2 content\n\n\n\n`);

        await expect(t.run_and_get_output(`Included: <% tp.file.include('[[Inc3]]') %>\n\n`)).to.eventually.be.rejectedWith(Error, "Reached inclusion depth limit (max = 10)");
        await expect(t.run_and_get_output(`Included: <% tp.file.include('Inc3') %>\n\n`)).to.eventually.be.rejectedWith(Error, "Invalid file format, provide an obsidian link between quotes.");

        await t.app.vault.delete(inc_file1);
        await t.app.vault.delete(inc_file2);
        await t.app.vault.delete(inc_file3);
    });

    t.test("tp.file.last_modified_date", async () => {
        // TODO
        /*
        expect(await t.run_and_get_output("Last modif date: <%tp.file.last_modified_date() %>\n\n")).to.equal("Last modif date: ");
        */
    });

    t.test("tp.file.path", async () => {
        // TODO
        //expect(await t.run_and_get_output("Path: <% tp.file.path(true) %>\n\n")).to.equal(`Path: ${TEMPLATE_FILE_NAME}\n\n`);
        await expect(t.run_and_get_output(`Path: <% tp.file.path(true) %>\n\n`)).to.eventually.equal(`Path: ${TARGET_FILE_NAME}.md\n\n`);
    });

    t.test("tp.file.selection", async () => {
        // TODO
    });

    t.test("tp.file.tags", async () => {
        await expect(t.run_and_get_output(`Tags: <% tp.file.tags %>\n\n`, `#tag1\n#tag2\n#tag3\n\n`, true)).to.eventually.equal(`Tags: #tag1,#tag2,#tag3\n\n`);
    });

    t.test("tp.file.title", async () => {
        await expect(t.run_and_get_output(`Title: <% tp.file.title %>\n\n`)).to.eventually.equal(`Title: ${TARGET_FILE_NAME}\n\n`);
    });
}
