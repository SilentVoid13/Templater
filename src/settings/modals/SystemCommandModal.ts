import { App, Modal, Setting } from "obsidian";

export class SystemCommandModal extends Modal {
    private name: string;
    private command: string;

    constructor(
        app: App,
        initialValues: { name: string; command: string },
        private onSubmit: (
            name: string,
            command: string,
        ) => Promise<void> | void,
        private validateName: (name: string) => string | undefined,
    ) {
        super(app);
        this.name = initialValues.name;
        this.command = initialValues.command;
    }

    onOpen() {
        this.setTitle("User function");
        this.modalEl.addClass("templater-system-command-modal");
        const { contentEl } = this;

        const functionNameSetting = new Setting(contentEl)
            .setName("Function name")
            .addText((cb) => {
                cb.setPlaceholder("Function name")
                    .setValue(this.name)
                    .onChange((value) => {
                        this.name = value;
                    });
            });

        new Setting(contentEl).setName("System command").addTextArea((cb) => {
            cb.setPlaceholder("System command")
                .setValue(this.command)
                .onChange((value) => {
                    this.command = value;
                });
            cb.inputEl.setAttr("rows", 4);
        });

        new Setting(contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText("Done")
                    .setCta()
                    .onClick(async () => {
                        const error = !this.name
                            ? "Function name cannot be empty"
                            : this.validateName(this.name);
                        if (error) {
                            functionNameSetting.setErrorMessage(error);
                            return;
                        }
                        await this.onSubmit(this.name, this.command);
                        this.close();
                    }),
            )
            .addButton((btn) =>
                btn.setButtonText("Cancel").onClick(() => this.close()),
            );
    }

    onClose() {
        this.contentEl.empty();
    }
}
