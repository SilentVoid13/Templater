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
        const texts = await this.getSuggestionTexts();
        return texts.map((text) => text.split("\n")[0]);
    }

    async getSuggestionTexts(): Promise<string[]> {
        const names: string[] = [];
        for await (const item of this.#suggestionEls) {
            names.push(await item.getText());
        }
        return names;
    }

    async dismiss() {
        await browser.keys("Escape");
        await this.#containerEl.waitForDisplayed({ reverse: true });
    }
}

export default new EditorSuggestions();
