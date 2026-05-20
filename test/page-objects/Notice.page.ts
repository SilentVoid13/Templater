class Notice {
    get #noticeEl() {
        return browser.$(".notice-container .notice");
    }

    async expectNoticeElWithText(text: string) {
        await expect(this.#noticeEl).toHaveText(text);
    }

    async expectTemplateParsingErrorNotice() {
        await this.expectNoticeElWithText(
            "Templater error:\n" +
                "Template parsing error, aborting.\n" +
                "Check console for more information",
        );
    }

    async expectInvalidReferenceDateFormatErrorNotice() {
        await this.expectNoticeElWithText(
            "Templater error:\n" +
                "Invalid reference date format, try specifying one with the argument 'reference_format'",
        );
    }

    async expectInclusionDepthLimitErrorNotice() {
        await this.expectNoticeElWithText(
            "Templater error:\n" + "Reached inclusion depth limit (max = 10)",
        );
    }
    async expectUserScriptsFolderNotFoundErrorNotice(folderName: string) {
        await this.expectNoticeElWithText(
            `Templater error:\nFolder "${folderName}" doesn't exist`,
        );
    }

    async expectFileNameCannotIncludeCharsErrorNotice() {
        await this.expectNoticeElWithText(
            "Templater error:\n" +
                "File name cannot contain any of these characters: \\ / :",
        );
    }

    async expectCancelledPromptErrorNotice() {
        await this.expectNoticeElWithText("Templater error:\nCancelled prompt");
    }

    async expectNoErrorNotice() {
        // eslint-disable-next-line wdio/no-pause
        await browser.pause(500);
        const isDisplayed = await this.#noticeEl
            .isDisplayed()
            .catch(() => false);
        expect(isDisplayed).toBe(false);
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
