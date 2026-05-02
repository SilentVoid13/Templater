class Notice {
    get #noticeEl() {
        return browser.$(".notice-container .notice");
    }

    async expectNoticeElWithText(text: string) {
        await expect(this.#noticeEl).toHaveText(text);
    }

    async expectTemplateParsingErrorNotice() {
        await this.expectNoticeElWithText(
            "Templater Error:\n" +
                "Template parsing error, aborting.\n" +
                "Check console for more information",
        );
    }

    async expectInvalidReferenceDateFormatErrorNotice() {
        await this.expectNoticeElWithText(
            "Templater Error:\n" +
                "Invalid reference date format, try specifying one with the argument 'reference_format'",
        );
    }

    async dismissAll() {
        let attempts = 0;
        const maxAttempts = 10;

        try {
            while (
                attempts < maxAttempts &&
                this.#noticeEl &&
                (await this.#noticeEl.isDisplayed())
            ) {
                await this.#noticeEl.click();
                attempts++;
            }
        } catch {
            // Notice doesn't exist or error occurred, continue
        }
    }
}

export default new Notice();
