class Notice {
	get noticeEl() {
		return browser.$(".notice-container .notice");
	}

	noticeElWithText(text: string) {
		// XPath concat() to safely handle text containing double quotes
		const xpathStr = text.includes('"')
			? `concat(${text
					.split('"')
					.map((part, i) => (i === 0 ? `"${part}"` : `'"',"${part}"`))
					.join(",")})`
			: `"${text}"`;
		return browser.$(
			`//div[contains(@class,"notice-container")]//div[contains(@class,"notice") and contains(., ${xpathStr})]`,
		);
	}

	async dismissAll() {
		let attempts = 0;
		const maxAttempts = 10;

		try {
			while (
				attempts < maxAttempts &&
				this.noticeEl &&
				(await this.noticeEl.isDisplayed())
			) {
				await this.noticeEl.click();
				attempts++;
			}
		} catch {
			// Notice doesn't exist or error occurred, continue
		}
	}
}

export default new Notice();
