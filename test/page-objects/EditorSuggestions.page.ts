class EditorSuggestions {
    // Obsidian keeps a container per suggester, so the closed ones stay in the
    // DOM: only a displayed one is the popup under test.
    get #containerEls() {
        return browser.$$(".suggestion-container");
    }

    async #displayedContainerEl() {
        for await (const el of this.#containerEls) {
            if (await el.isDisplayed()) {
                return el;
            }
        }
        return null;
    }

    async waitForDisplayed() {
        await browser.waitUntil(() => this.isDisplayed(), {
            timeoutMsg: "suggestion container never displayed",
        });
    }

    async isDisplayed(): Promise<boolean> {
        return browser.execute(() =>
            Array.from(
                activeDocument.querySelectorAll<HTMLElement>(
                    ".suggestion-container",
                ),
            ).some((el) => el.offsetParent !== null),
        );
    }

    async getSuggestionNames(): Promise<string[]> {
        const texts = await this.getSuggestionTexts();
        return texts.map((text) => text.split("\n")[0]);
    }

    /** Read in one round trip, the suggestions are re-rendered on every keystroke. */
    async getSuggestionTexts(): Promise<string[]> {
        return browser.execute(() =>
            Array.from(
                activeDocument.querySelectorAll<HTMLElement>(
                    ".suggestion-container",
                ),
            )
                .filter((container) => container.offsetParent !== null)
                .flatMap((container) =>
                    Array.from(
                        container.querySelectorAll<HTMLElement>(
                            ".suggestion-item",
                        ),
                    ).map((item) => item.innerText),
                ),
        );
    }

    async expectSuggestionNamesToContain(name: string) {
        await browser.waitUntil(async () => {
            expect(await this.getSuggestionNames()).toContain(name);
            return true;
        });
    }

    async selectSuggestionByName(name: string) {
        await browser.waitUntil(async () => {
            const container = await this.#displayedContainerEl();
            if (!container) {
                return false;
            }
            for await (const el of container.$$(".suggestion-item")) {
                const text = await el.getText();
                if (text.split("\n")[0] === name) {
                    await el.click();
                    return true;
                }
            }
            return false;
        });
    }

    async dismiss() {
        await browser.keys("Escape");
        await browser.waitUntil(async () => !(await this.isDisplayed()));
    }
}

export default new EditorSuggestions();
