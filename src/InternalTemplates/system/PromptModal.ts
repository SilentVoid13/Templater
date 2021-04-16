import { App, Modal } from "obsidian";

export class PromptModal extends Modal {
    private promptEl: HTMLInputElement;
    private cb: (value: string) => void;

    constructor(app: App, private prompt_text: string, private default_value: string) {
        super(app);
    }

    onOpen() {
        this.titleEl.setText(this.prompt_text);
        this.createForm();
    }

    onClose() {
        this.contentEl.empty();
    }

    createForm() {
        let div = this.contentEl.createDiv();
        div.addClass("templater-prompt-div");

        let form = div.createEl("form");
        form.addClass("templater-prompt-form");
        form.type = "submit";
        form.onsubmit = (e: Event) => {
            e.preventDefault();
            this.cb(this.promptEl.value);
            this.close();
        }

        this.promptEl = form.createEl("input");
        this.promptEl.type = "text";
        this.promptEl.placeholder = "Type text here...";
        this.promptEl.value = this.default_value ?? "";
        this.promptEl.addClass("templater-prompt-input")
        this.promptEl.select();
    }

    async openAndGetValue(cb: (value: string) => void) {
        this.cb = cb;
        this.open();
    }
}