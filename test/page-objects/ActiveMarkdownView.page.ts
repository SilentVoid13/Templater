class ActiveMarkdownView {
    #activeEditorSelector =
        ".workspace-leaf.mod-active .workspace-leaf-content[data-type=markdown]";

    get activeEditorEl() {
        return browser.$(this.#activeEditorSelector);
    }

    get titleEl() {
        return this.activeEditorEl.$(".view-header-title");
    }

    get propertiesEl() {
        return this.activeEditorEl.$(
            ".metadata-properties .metadata-property",
        );
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

    async expectPropertiesToBeVisible() {
        await this.propertiesEl.waitForDisplayed();
    }
}

export default new ActiveMarkdownView();
