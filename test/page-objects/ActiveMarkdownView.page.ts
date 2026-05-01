class ActiveMarkdownView {
    #activeEditorSelector =
        ".workspace-leaf.mod-active .workspace-leaf-content[data-type=markdown]";

    get activeEditorEl() {
        return browser.$(this.#activeEditorSelector);
    }

    get titleEl() {
        return this.activeEditorEl.$(".view-header-title");
    }

    async waitForFocus() {
        await this.activeEditorEl.waitForDisplayed();
        await this.activeEditorEl.click();
        await browser.waitUntil(async () => {
            return browser.execute(() => {
                const active = activeDocument.activeElement;
                return !!active?.closest(this.#activeEditorSelector);
            });
        });
    }
}

export default new ActiveMarkdownView();
