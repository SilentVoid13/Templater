class TemplaterSettingsPage {
    get settingsModalEl() {
        return browser.$(".modal.mod-settings");
    }

    get settingsContentEl() {
        return this.settingsModalEl.$(".vertical-tab-content");
    }

    async open() {
        await browser.executeObsidian(({ app }) => {
            app.setting?.open?.();
            app.setting?.openTabById?.("templater-obsidian");
        });
        await this.settingsContentEl.waitForDisplayed();
        // Obsidian caches getSettingDefinitions() output. Calling update() forces a
        // re-read so that local settings written just before open() are reflected
        // in visibility conditions (e.g. enable_system_commands, enable_startup_templates).
        await browser.executeObsidian(({ app }) => {
            app.setting?.activeTab?.update?.();
        });
    }

    async close() {
        const isOpen = await this.settingsModalEl
            .isDisplayed()
            .catch(() => false);
        if (!isOpen) return;
        await browser.executeObsidian(({ app }) => {
            app.setting?.close?.();
        });
        await this.settingsModalEl.waitForDisplayed({ reverse: true });
    }

    get settingItemErrorEl() {
        return this.settingsContentEl.$(".setting-item-error");
    }

    /**
     * Click a toggle (checkbox) inside a .setting-item whose .setting-item-name
     * exactly matches the given name.
     */
    async clickToggleByName(name: string) {
        await browser.waitUntil(async () => {
            for await (const setting of this.settingsContentEl.$$(
                ".setting-item",
            )) {
                try {
                    const text = await setting
                        .$(".setting-item-name")
                        .getText();
                    if (text === name) {
                        await setting.$("input[type='checkbox']").click();
                        return true;
                    }
                } catch {
                    continue;
                }
            }
            return false;
        });
    }

    /**
     * Click a button anywhere in the settings content whose aria-label exactly
     * matches the given label. Used for list "add" buttons which Obsidian renders
     * as a `+` icon div (class `clickable-icon extra-setting-button`) with the
     * item's `name` as the `aria-label` tooltip — not a traditional `<button>`.
     */
    async clickButtonWithText(text: string) {
        await browser.waitUntil(async () => {
            for await (const el of this.settingsContentEl.$$("[aria-label]")) {
                try {
                    const ariaLabel = await el.getAttribute("aria-label");
                    if (ariaLabel === text) {
                        await el.click();
                        return true;
                    }
                } catch {
                    continue;
                }
            }
            return false;
        });
    }

    /**
     * Set the value of an `<input>` matching a specific placeholder attribute.
     * `index` selects among all matching inputs in the settings content area —
     * use this when multiple list items share the same placeholder (e.g. two
     * "Folder" inputs when there are two folder template items).
     *
     * Use this for inline list items whose .setting-item-info is hidden and
     * therefore cannot be located by setTextInputByName.
     */
    async setInputByPlaceholder(placeholder: string, value: string, index = 0) {
        await browser.waitUntil(async () => {
            const inputs: WebdriverIO.Element[] = [];
            for await (const input of this.settingsContentEl.$$(
                `input[placeholder="${placeholder}"]`,
            )) {
                inputs.push(input);
            }
            if (inputs.length <= index) return false;
            await inputs[index].clearValue();
            await inputs[index].addValue(value);
            return true;
        });
    }

    /**
     * Select a dropdown option inside a .setting-item whose .setting-item-name
     * exactly matches the given name. Uses visible text to identify the option.
     */
    async selectDropdownOptionByName(settingName: string, optionText: string) {
        await browser.waitUntil(async () => {
            for await (const setting of this.settingsContentEl.$$(
                ".setting-item:not(.setting-item-heading)",
            )) {
                try {
                    const text = await setting
                        .$(".setting-item-name")
                        .getText();
                    if (text === settingName) {
                        await setting
                            .$("select")
                            .selectByVisibleText(optionText);
                        return true;
                    }
                } catch {
                    continue;
                }
            }
            return false;
        });
    }

    /**
     * Set the value of an input inside .setting-item(s) whose .setting-item-name
     * exactly matches the given name. `inputIndex` selects among all inputs
     * collected (in DOM order) across every matching item — use 0 for the first
     * input in the first item, 1 for the second input in the first item (or the
     * first input of the second item if the first item has only one input), etc.
     */
    async setTextInputByName(
        settingName: string,
        value: string,
        inputIndex = 0,
    ) {
        await browser.waitUntil(async () => {
            const inputs: WebdriverIO.Element[] = [];
            for await (const setting of this.settingsContentEl.$$(
                ".setting-item:not(.setting-item-heading)",
            )) {
                try {
                    const text = await setting
                        .$(".setting-item-name")
                        .getText();
                    if (text === settingName) {
                        for await (const input of setting.$$("input")) {
                            inputs.push(input);
                        }
                    }
                } catch {
                    continue;
                }
            }
            if (inputs.length <= inputIndex) return false;
            // Use execute() + dispatchEvent instead of key simulation so that
            // both text and number inputs reliably fire the input/change events
            // that Obsidian's declarative controls listen on.
            await browser.execute(
                (el, val) => {
                    const input = el as HTMLInputElement;
                    input.value = val;
                    input.dispatchEvent(new Event("input", { bubbles: true }));
                    input.dispatchEvent(new Event("change", { bubbles: true }));
                },
                inputs[inputIndex] as unknown as HTMLElement,
                value,
            );
            return true;
        });
    }

    /**
     * Click a .setting-item row (e.g. a sub-page navigation item) whose
     * .setting-item-name exactly matches the given name. Headings are excluded
     * so that groups whose heading shares a name with a page item (e.g.
     * "Startup templates") don't accidentally intercept the click.
     *
     * Uses browser.execute to perform the query and click atomically inside the
     * browser, avoiding stale-element errors from Obsidian re-rendering the
     * settings DOM between WebDriver round-trips.
     */
    async clickSettingRowByName(name: string) {
        await browser.waitUntil(async () => {
            const clicked = await browser.execute((name) => {
                const container = activeDocument.querySelector(
                    ".modal.mod-settings .vertical-tab-content",
                );
                if (!container) return false;
                for (const setting of Array.from(
                    container.querySelectorAll<HTMLElement>(
                        ".setting-item:not(.setting-item-heading)",
                    ),
                )) {
                    const nameEl = setting.querySelector(".setting-item-name");
                    if (nameEl?.textContent?.trim() === name) {
                        setting.click();
                        return true;
                    }
                }
                return false;
            }, name);
            if (clicked) {
                // eslint-disable-next-line wdio/no-pause -- Need to wait for page transition
                await browser.pause(500);
            }
            return clicked;
        });
    }
}

export default new TemplaterSettingsPage();
