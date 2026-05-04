class OpenInsertTemplateModal {
    get modalEl() {
        return browser.$(".templater-fuzzy-suggester-modal");
    }
    get inputEl() {
        return this.modalEl.$("input");
    }
    get suggestionEls() {
        return this.modalEl.$$(".prompt-results .suggestion-item");
    }
    get suggestionEl() {
        return this.modalEl.$(".prompt-results .suggestion-item");
    }
    get selectedSuggestionEl() {
        return this.modalEl.$(".prompt-results .suggestion-item.is-selected");
    }
    get emptyMessageEl() {
        return this.modalEl.$(".suggestion-empty");
    }

    async open() {
        await browser.executeObsidianCommand(
            "templater-obsidian:insert-templater",
        );
        await this.modalEl.waitForDisplayed();
    }

    async enterSnippetName(name: string) {
        await this.inputEl.waitForDisplayed();
        await this.inputEl.addValue(name);
    }

    async selectSuggestionByName(name: string) {
        await browser.waitUntil(async () => {
            for await (const el of this.suggestionEls) {
                if ((await el.getText()) === name) {
                    await el.click();
                    return true;
                }
            }
            return false;
        });
        await this.modalEl.waitForDisplayed({ reverse: true });
    }
}

export default new OpenInsertTemplateModal();
