import { browser } from "@wdio/globals";

class Clipboard {
    async setClipboardText(text: string) {
        await browser.executeObsidian(async (_, value: string) => {
            try {
                if (navigator?.clipboard?.writeText) {
                    await navigator.clipboard.writeText(value);
                    return;
                }
            } catch {
                // fallback below
            }

            const electron = window.require("electron") as unknown;
            const electronClipboard =
                typeof electron === "object" &&
                electron &&
                "clipboard" in electron
                    ? electron.clipboard
                    : null;
            if (
                electronClipboard &&
                typeof electronClipboard === "object" &&
                "writeText" in electronClipboard &&
                typeof electronClipboard.writeText === "function"
            ) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                electronClipboard.writeText(value);
                return;
            }

            throw new Error("Clipboard APIs are unavailable");
        }, text);
    }
}

export default new Clipboard();
