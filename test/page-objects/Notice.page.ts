class Notice {
    get #noticeEl() {
        return browser.$(".notice-container .notice");
    }

    async expectNoticeElWithText(text: string) {
        await expect(this.#noticeEl).toHaveText(text);
    }
}

export default new Notice();
