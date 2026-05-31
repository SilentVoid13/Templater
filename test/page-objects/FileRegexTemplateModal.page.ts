class FileRegexTemplateModal {
    get modalEl() {
        return browser.$(".templater-file-regex-template-modal");
    }

    get regexInputEl() {
        return this.modalEl.$(".setting-item:first-child input[type='text']");
    }

    get templateInputEl() {
        return this.modalEl.$(".setting-item:nth-child(2) input[type='text']");
    }

    get doneBtnEl() {
        return this.modalEl.$("button.mod-cta");
    }

    get cancelBtnEl() {
        return this.modalEl.$("button:not(.mod-cta)");
    }

    get errorMessageEl() {
        return this.modalEl.$(".setting-item-error");
    }

    async waitForDisplayed() {
        await this.modalEl.waitForDisplayed();
    }

    async setRegex(value: string) {
        await this.regexInputEl.clearValue();
        await this.regexInputEl.addValue(value);
        await browser.execute((el) => el.blur(), await this.regexInputEl);
    }

    async setTemplate(path: string) {
        await this.templateInputEl.clearValue();
        await this.templateInputEl.addValue(path);
        await browser.execute((el) => el.blur(), await this.templateInputEl);
    }

    async clickDone() {
        await this.doneBtnEl.click();
    }

    async clickCancel() {
        await this.cancelBtnEl.click();
        await this.modalEl.waitForDisplayed({ reverse: true });
    }
}

export default new FileRegexTemplateModal();
