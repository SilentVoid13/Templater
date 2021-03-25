import { InternalModuleDate } from "InternalTemplates/date/InternalModuleDate";
import { TFile } from "obsidian";

const mock_file: TFile = {
    vault: null,
    path: "/mock/path",
    parent: null,
    stat: null, 
    name: "Mock file", 
    basename: "Mock file", 
    extension: "md"
};

const date = new InternalModuleDate(null, mock_file);

test("tp.date.now", () => {
    let now = date.generate_now();

    expect(now()).toBe(null);
});

test("tp.date.tomorrow", () => {
    let tomorrow = date.generate_tomorrow();

    let tomorrow_date = null;

    expect(tomorrow()).toBe(tomorrow_date);
})