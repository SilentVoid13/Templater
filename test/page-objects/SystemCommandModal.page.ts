class SystemCommandModal {
    get modalEl() {
        return browser.$(".templater-system-command-modal");
    }

    get functionNameInputEl() {
        // First Setting's text input — function name field
        return this.modalEl.$(".setting-item:first-child input[type='text']");
    }

    get systemCommandTextareaEl() {
        return this.modalEl.$("textarea");
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

    async setFunctionName(name: string) {
        await this.functionNameInputEl.clearValue();
        await this.functionNameInputEl.addValue(name);
    }

    async setSystemCommand(command: string) {
        await this.systemCommandTextareaEl.clearValue();
        await this.systemCommandTextareaEl.addValue(command);
    }

    async clickDone() {
        await this.doneBtnEl.click();
    }

    async clickCancel() {
        await this.cancelBtnEl.click();
        await this.modalEl.waitForDisplayed({ reverse: true });
    }
}

export default new SystemCommandModal();
