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
        const selector = this.#activeEditorSelector;
        await browser.waitUntil(async () => {
            return browser.execute((sel: string) => {
                const active = activeDocument.activeElement;
                return !!active?.closest(sel);
            }, selector);
        });
    }

    async setSelection(
        from: { line: number; ch: number },
        to: { line: number; ch: number },
    ): Promise<void> {
        await browser.executeObsidian(
            (
                { app },
                payload: {
                    from: { line: number; ch: number };
                    to: { line: number; ch: number };
                },
            ) => {
                const editor = app.workspace.activeEditor?.editor;
                if (!editor) throw new Error("No active editor");
                editor.setSelection(payload.from, payload.to);
            },
            { from, to },
        );
    }

    async expectPropertiesToBeVisible() {
        await this.propertiesEl.waitForDisplayed();
    }
}

export default new ActiveMarkdownView();
