class EmptyStateView {
    get contentEl() {
        return browser.$(
            ".workspace-leaf.mod-active .workspace-leaf-content[data-type=empty]",
        );
    }

    async getCreateNewNoteButtonEl() {
        for await (const el of this.contentEl.$$(".empty-state-action")) {
            if (/new note/i.test(await el.getText())) {
                return el;
            }
        }
        throw new Error("Could not find empty state new note button");
    }

    async clickCreateNewNote() {
        const button = await this.getCreateNewNoteButtonEl();
        await button.click();
    }
}

export default new EmptyStateView();
