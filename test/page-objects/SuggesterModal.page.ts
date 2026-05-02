import { browser } from "@wdio/globals";

class SuggesterModal {
    get modalEl() {
        return browser.$(".templater-suggester-modal");
    }

    get inputEl() {
        return this.modalEl.$(".prompt-input");
    }

    get suggestionEls() {
        return this.modalEl.$$(".prompt-results .suggestion-item");
    }

    async waitForDisplayed() {
        await this.inputEl.waitForDisplayed();
    }

    async selectSuggestionByName(name: string) {
        await browser.waitUntil(async () => {
            for await (const item of this.suggestionEls) {
                if ((await item.getText()) === name) {
                    await item.click();
                    return true;
                }
            }
            return false;
        });
        await this.modalEl.waitForDisplayed({ reverse: true });
    }

    async filterAndSelectByName(query: string, name: string) {
        await this.waitForDisplayed();
        await this.inputEl.setValue(query);
        await this.selectSuggestionByName(name);
    }

    async submit(): Promise<void> {
        await this.waitForDisplayed();
        await browser.keys("Enter");
        await this.modalEl.waitForDisplayed({ reverse: true });
    }

    async cancel() {
        await this.waitForDisplayed();
        await browser.keys("Escape");
        await this.modalEl.waitForDisplayed({ reverse: true });
    }
}

export default new SuggesterModal();
