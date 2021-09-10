import { TemplaterError } from "Error";
import { App, Modal } from "obsidian";

export class PromptModal extends Modal {
    private promptEl: HTMLInputElement;
    private resolve: (value: string) => void;
    private reject: (reason?: any) => void;
    private submitted: boolean = false;

    constructor(app: App, private prompt_text: string, private default_value: string) {
        super(app);
    }

    onOpen(): void {
        this.titleEl.setText(this.prompt_text);
        this.createForm();
    }

    onClose(): void {
        this.contentEl.empty();
        if (!this.submitted) {
            this.reject(new TemplaterError("Cancelled prompt"));
        }
    }

    createForm(): void {
        const div = this.contentEl.createDiv();
        div.addClass("templater-prompt-div");

        const form = div.createEl("form");
        form.addClass("templater-prompt-form");
        form.type = "submit";
        form.onsubmit = (e: Event) => {
            this.submitted = true;
            e.preventDefault();
            this.resolve(this.promptEl.value);
            this.close();
        }

        this.promptEl = form.createEl("input");
        this.promptEl.type = "text";
        this.promptEl.placeholder = "Type text here...";
        this.promptEl.value = this.default_value ?? "";
        this.promptEl.addClass("templater-prompt-input")
        this.promptEl.select();
    }

    async openAndGetValue(resolve: (value: string) => void, reject: (reason?: any) => void): Promise<void> {
        this.resolve = resolve;
        this.reject = reject;
        this.open();
    }
}