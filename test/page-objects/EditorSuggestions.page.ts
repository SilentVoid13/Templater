class EditorSuggestions {
    get #containerEl() {
        return browser.$(".suggestion-container");
    }

    get #suggestionEls() {
        return browser.$$(".suggestion-container .suggestion-item");
    }

    async waitForDisplayed() {
        await this.#containerEl.waitForDisplayed();
    }

    async isDisplayed(): Promise<boolean> {
        return this.#containerEl.isDisplayed();
    }

    async getSuggestionNames(): Promise<string[]> {
        const names: string[] = [];
        for await (const item of this.#suggestionEls) {
            names.push((await item.getText()).split("\n")[0]);
        }
        return names;
    }

    async dismiss() {
        await browser.keys("Escape");
        await this.#containerEl.waitForDisplayed({ reverse: true });
    }
}

export default new EditorSuggestions();
