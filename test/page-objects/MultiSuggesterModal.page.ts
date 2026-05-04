import { browser } from "@wdio/globals";

class MultiSuggesterModal {
    get modalEl() {
        return browser.$(".modal:has(.templater-multisuggester-input)");
    }

    get inputEl() {
        return this.modalEl.$(".templater-multisuggester-input");
    }

    get #title() {
        return this.modalEl.$(".modal-title");
    }

    // AbstractInputSuggest renders its popup outside the modal in the document body
    get inlineSuggestionEls() {
        return browser.$$(".suggestion-item");
    }

    get saveButtonEl() {
        return this.modalEl.$(".modal-button-container button.mod-cta");
    }

    get cancelButtonEl() {
        return this.modalEl.$(".modal-button-container button:not(.mod-cta)");
    }

    async waitForDisplayed() {
        await this.inputEl.waitForDisplayed();
    }

    async expectSuggestionCountToBe(expectedCount: number) {
        await this.waitForDisplayed();
        await expect(this.inlineSuggestionEls).toBeElementsArrayOfSize(
            expectedCount,
        );
    }

    async expectTitleToBe(expectedTitle: string) {
        await this.waitForDisplayed();
        expect(await this.#title.getText()).toBe(expectedTitle);
    }

    async selectItem(name: string) {
        await this.waitForDisplayed();
        await browser.waitUntil(async () => {
            for await (const item of this.inlineSuggestionEls) {
                if ((await item.getText()).includes(name)) {
                    await item.click();
                    return true;
                }
            }
            return false;
        });
    }

    async filterAndSelectByName(query: string, name: string) {
        await this.waitForDisplayed();
        await this.inputEl.setValue(query);
        await this.selectItem(name);
    }

    async save() {
        await this.saveButtonEl.click();
        await this.modalEl.waitForDisplayed({ reverse: true });
    }

    async cancel() {
        await this.cancelButtonEl.waitForDisplayed();
        await this.cancelButtonEl.click();
        await this.modalEl.waitForDisplayed({ reverse: true });
    }
}

export default new MultiSuggesterModal();
