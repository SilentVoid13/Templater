import { Notice } from "obsidian";
import { TemplaterError } from "./Error";

export function log_update(msg: string): void {
    const notice = new Notice("", 15000);
    const messageEl = createFragment((frag) => {
        frag.createEl("b", { text: "Templater update" });
        frag.createEl("span", { text: ":" });
        frag.createEl("br");
        frag.createEl("span", { text: msg });
    });
    notice.noticeEl.appendChild(messageEl);
}

export function log_error(e: Error | TemplaterError): void {
    const notice = new Notice("", 8000);
    const messageEl = createFragment((frag) => {
        frag.createEl("b", { text: "Templater Error" });
        frag.createEl("span", { text: ":" });
        frag.createEl("br");
        frag.createEl("span", { text: e.message });
        if (e instanceof TemplaterError && e.console_msg) {
            frag.createEl("br");
            frag.createEl("span", {
                text: "Check console for more information",
            });
            console.error(`Templater Error:`, e.message, "\n", e.console_msg);
        }
    });
    notice.noticeEl.appendChild(messageEl);
}
