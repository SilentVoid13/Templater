class ConfirmDangerousSettingModal {
    get modalEl() {
        return browser.$(".templater-confirm-dangerous-setting-modal");
    }

    get checkboxEl() {
        return this.modalEl.$("input[type='checkbox']");
    }

    get enableBtnEl() {
        return this.modalEl.$("button.mod-cta");
    }

    get cancelBtnEl() {
        // The cancel button does not have mod-cta; look for a sibling button
        return this.modalEl.$("button:not(.mod-cta)");
    }

    async waitForDisplayed() {
        await this.modalEl.waitForDisplayed();
    }

    async expectEnableBtnDisabled() {
        await expect(this.enableBtnEl).toBeDisabled();
    }

    async expectEnableBtnEnabled() {
        await expect(this.enableBtnEl).toBeEnabled();
    }

    async checkUnderstandRisks() {
        await this.checkboxEl.click();
    }

    async clickEnable() {
        await this.enableBtnEl.click();
        await this.modalEl.waitForDisplayed({ reverse: true });
    }

    async clickCancel() {
        await this.cancelBtnEl.click();
        await this.modalEl.waitForDisplayed({ reverse: true });
    }
}

export default new ConfirmDangerousSettingModal();
