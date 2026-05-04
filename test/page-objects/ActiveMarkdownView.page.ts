import type { EditorPosition, EditorSelection } from "obsidian";

class ActiveMarkdownView {
    #leafContentSelector =
        ".workspace-leaf.mod-active .workspace-leaf-content[data-type=markdown]";

    #editorSelector = `${this.#leafContentSelector} .cm-content`;

    get leafContentEl() {
        return browser.$(this.#leafContentSelector);
    }

    get titleEl() {
        return this.leafContentEl.$(".view-header-title");
    }

    get propertiesEl() {
        return this.leafContentEl.$(".metadata-properties .metadata-property");
    }

    get editorEl() {
        return browser.$(this.#editorSelector);
    }

    async focusEditor() {
        await this.leafContentEl.waitForDisplayed();
        await browser.waitUntil(async () => {
            return browser.execute((selector) => {
                const el = activeDocument.querySelector(selector);
                if (!el || !el.instanceOf(HTMLElement)) return false;
                el.focus();
                const active = activeDocument.activeElement;
                return !!active?.closest(selector);
            }, this.#editorSelector);
        });
    }

    async setSelection(
        from: EditorPosition,
        to: EditorPosition,
    ): Promise<void> {
        await browser.executeObsidian(
            (
                { app },
                payload: {
                    from: EditorPosition;
                    to: EditorPosition;
                },
            ) => {
                const editor = app.workspace.activeEditor?.editor;
                if (!editor) throw new Error("No active editor");
                editor.setSelection(payload.from, payload.to);
            },
            { from, to },
        );
    }

    async setSelections(ranges: EditorSelection[]): Promise<void> {
        await browser.executeObsidian(({ app }, payload: EditorSelection[]) => {
            const editor = app.workspace.activeEditor?.editor;
            if (!editor) throw new Error("No active editor");
            editor.setSelections(payload);
        }, ranges);
    }

    async expectSelectionsToEqual(expectedSelections: EditorSelection[]) {
        await browser.waitUntil(async () => {
            const selections = await browser.executeObsidian(({ app }) => {
                const editor = app.workspace.activeEditor?.editor;
                if (!editor) throw new Error("No active editor");
                return editor.listSelections();
            });
            expect(selections).toEqual(expectedSelections);
            return true;
        });
    }

    async expectCursorsToEqual(expected: EditorPosition[]) {
        await this.focusEditor();
        await browser.waitUntil(async () => {
            const cursors = await browser.executeObsidian(({ app }) => {
                const editor = app.workspace.activeEditor?.editor;
                if (!editor) throw new Error("No active editor");
                return editor.listSelections().map((sel) => sel.head);
            });
            expect(cursors).toEqual(expected);
            return true;
        });
    }

    async expectPropertiesToBeVisible() {
        await this.propertiesEl.waitForDisplayed();
    }
}

export default new ActiveMarkdownView();
