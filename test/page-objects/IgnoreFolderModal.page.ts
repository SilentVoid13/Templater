class IgnoreFolderModal {
    get modalEl() {
        return browser.$(".templater-ignore-folder-modal");
    }

    get inputEl() {
        return this.modalEl.$("input[type='text']");
    }

    get doneBtnEl() {
        return this.modalEl.$(".modal-button-container button.mod-cta");
    }

    get cancelBtnEl() {
        return this.modalEl.$(
            ".modal-button-container button:not(.mod-cta)",
        );
    }

    async waitForDisplayed() {
        await this.modalEl.waitForDisplayed();
    }

    async setFolderPath(path: string) {
        await this.inputEl.clearValue();
        await this.inputEl.addValue(path);
    }

    async clickDone() {
        await this.doneBtnEl.click();
        await this.modalEl.waitForDisplayed({ reverse: true });
    }

    async clickCancel() {
        await this.cancelBtnEl.click();
        await this.modalEl.waitForDisplayed({ reverse: true });
    }
}

export default new IgnoreFolderModal();
