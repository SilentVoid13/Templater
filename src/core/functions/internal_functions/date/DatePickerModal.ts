import { TemplaterError } from "utils/Error";
import {
    ButtonComponent,
    Modal,
    moment
} from "obsidian";

export class DateModal extends Modal {
    private resolve: (value: string) => void;
    private reject: (reason?: TemplaterError) => void;
    private submitted = false;
    private value: string;

    constructor(
        private title: string,
        private format: string,
    ) {
        super(app);
        this.value = moment().format(format);
    }

    onOpen(): void {
        this.titleEl.setText(this.title);
        this.createForm();
    }

    onClose(): void {
        this.contentEl.empty();
        if (!this.submitted) {
            // TOFIX: for some reason throwing TemplaterError on iOS causes the app to freeze.
            // this.reject(new TemplaterError("Cancelled prompt"));
            this.reject();
        }
    }

    createForm(): void {
        const div = this.contentEl.createDiv();
        div.addClass("templater-date-div");
        const datePicker = this.contentEl.createEl("input");
        datePicker.type = "date";
        const buttonDiv = this.contentEl.createDiv();
        buttonDiv.addClass("templater-button-div");
        const submitButton = new ButtonComponent(buttonDiv);
        submitButton.buttonEl.addClass("mod-cta");
        submitButton.setButtonText("Submit").onClick((evt: Event) => {
            this.resolveAndClose(evt);
        });

        datePicker.addClass("templater-prompt-input");
        datePicker.value = this.value;
        datePicker.addEventListener("input", (event) => {
            this.value = moment((event.target as HTMLInputElement)?.valueAsDate).format(this.format) || moment().format(this.format);
        });
    }

    private resolveAndClose(evt: Event | KeyboardEvent) {
        this.submitted = true;
        evt.preventDefault();
        this.resolve(this.value);
        this.close();
    }

    async openAndGetValue(
        resolve: (value: string) => void,
        reject: (reason?: TemplaterError) => void
    ): Promise<void> {
        this.resolve = resolve;
        this.reject = reject;
        this.open();
    }
}
