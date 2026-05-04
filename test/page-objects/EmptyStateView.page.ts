class EmptyStateView {
    get contentEl() {
        return browser.$(
            ".workspace-leaf.mod-active .workspace-leaf-content[data-type=empty]",
        );
    }

    get createNewNoteButtonEl() {
        return this.contentEl.$(`.empty-state-action*=Create new note`);
    }

    async clickCreateNewNote() {
        await this.createNewNoteButtonEl.isClickable();
        await this.createNewNoteButtonEl.click();
    }
}

export default new EmptyStateView();
