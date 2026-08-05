type ToggleName = "Insert command" | "Create command";

class TemplateHotkeyModal {
    get modalEl() {
        return browser.$(".templater-template-hotkey-modal");
    }

    get inputEl() {
        return this.modalEl.$("input[type='text']");
    }

    get errorEl() {
        return this.modalEl.$(".setting-item-error");
    }

    get doneBtnEl() {
        return this.modalEl.$("button.mod-cta");
    }

    get cancelBtnEl() {
        return this.modalEl.$("button:not(.mod-cta)");
    }

    async waitForDisplayed() {
        await this.modalEl.waitForDisplayed();
    }

    async setTemplatePath(path: string) {
        await this.inputEl.clearValue();
        await this.inputEl.addValue(path);
        await browser.execute((el) => el.blur(), await this.inputEl);
    }

    /** Clicks the "Insert command" or "Create command" toggle. */
    async clickToggle(name: ToggleName) {
        for await (const setting of this.modalEl.$$(".setting-item")) {
            const text = await setting.$(".setting-item-name").getText();
            if (text === name) {
                await setting.$("input[type='checkbox']").click();
                return;
            }
        }
        throw new Error(`No toggle named "${name}" in the modal`);
    }

    /**
     * Reads the visual state via the .is-enabled class on .checkbox-container,
     * which is what Obsidian uses to reflect the on/off state rather than
     * checkbox.checked.
     */
    async expectToggleValue(name: ToggleName, expected: boolean) {
        await browser.waitUntil(() =>
            browser.execute(
                (name, expected) => {
                    const modal = activeDocument.querySelector(
                        ".templater-template-hotkey-modal",
                    );
                    for (const setting of Array.from(
                        modal?.querySelectorAll<HTMLElement>(".setting-item") ??
                            [],
                    )) {
                        const nameEl =
                            setting.querySelector(".setting-item-name");
                        if (nameEl?.textContent?.trim() === name) {
                            const container =
                                setting.querySelector(".checkbox-container");
                            return (
                                container?.classList.contains("is-enabled") ===
                                expected
                            );
                        }
                    }
                    return false;
                },
                name,
                expected,
            ),
        );
    }

    async clickDone() {
        await this.doneBtnEl.click();
        await this.modalEl.waitForDisplayed({ reverse: true });
    }

    /**
     * Clicks Done expecting the submission to be rejected, so the modal stays
     * open and an inline error message is shown.
     */
    async clickDoneExpectingError() {
        await this.doneBtnEl.click();
        await this.errorEl.waitForDisplayed();
    }

    async clickCancel() {
        await this.cancelBtnEl.click();
        await this.modalEl.waitForDisplayed({ reverse: true });
    }
}

export default new TemplateHotkeyModal();
