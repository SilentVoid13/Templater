import { browser } from "@wdio/globals";

class RenameFileModal {
    get modalEl() {
        return browser.$(".modal.mod-file-rename");
    }

    get cancelButtonEl() {
        return this.modalEl.$("button.mod-cancel");
    }

    async expectDisplayed() {
        await this.modalEl.waitForDisplayed();
    }

    async clickCancel() {
        await this.expectDisplayed();
        await this.cancelButtonEl.click();
        await this.modalEl.waitForDisplayed({ reverse: true });
    }
}

export default new RenameFileModal();
