import { browser } from "@wdio/globals";

class PromptModal {
    get modalEl() {
        return browser.$(".modal:has(.templater-prompt-div)");
    }

    get inputEl() {
        return this.modalEl.$(".templater-prompt-input");
    }

    get submitButtonEl() {
        return this.modalEl.$(".templater-button-div button.mod-cta");
    }

    async waitForDisplayed() {
        await this.inputEl.waitForDisplayed();
    }

    async enterValue(value: string) {
        await this.waitForDisplayed();
        // Use JS to set the value to avoid \n triggering Enter and submitting the form
        await browser.execute(
            (selector: string, val: string) => {
                const el = activeDocument.querySelector(selector) as
                    | HTMLInputElement
                    | HTMLTextAreaElement;
                el.value = val;
                el.dispatchEvent(new Event("input"));
            },
            ".templater-prompt-input",
            value,
        );
    }

    async submit() {
        await this.waitForDisplayed();
        await browser.keys("Enter");
        await this.modalEl.waitForDisplayed({ reverse: true });
    }

    async submitMultiLine() {
        await this.waitForDisplayed();
        await this.submitButtonEl.click();
        await this.modalEl.waitForDisplayed({ reverse: true });
    }

    async cancel() {
        await this.waitForDisplayed();
        await browser.keys("Escape");
        await this.modalEl.waitForDisplayed({ reverse: true });
    }
}

export default new PromptModal();
