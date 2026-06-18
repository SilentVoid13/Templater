import { App, ConfirmationButton, ConfirmationModal, Platform } from "obsidian";

export class ConfirmDangerousSettingModal extends ConfirmationModal {
    constructor(
        app: App,
        title: string,
        warningText: string,
        onConfirm: () => Promise<void> | void,
    ) {
        super(app);
        this.setTitle(title);
        this.modalEl.addClass("templater-confirm-dangerous-setting-modal");
        this.contentEl.createEl("p", { text: warningText });
        this.contentEl.createEl("p", {
            text: "Only enable this if you trust the current and future contents of this vault, including files you may later download, copy, or sync from other people.",
            cls: "mod-warning",
        });
        this.contentEl.createEl("p", {
            text: "This setting is stored on this device only; enable it separately on each device where you use this vault.",
        });

        let enableBtn!: ConfirmationButton;
        if (Platform.isMobile) {
            this.addButton((btn) => {
                enableBtn = btn;
                btn.setButtonText("I understand the risks, enable")
                    .setCta()
                    .onClick(async () => {
                        await onConfirm();
                    });
            });
        } else {
            this.addCheckbox("I understand the risks", (checked) => {
                enableBtn.setDisabled(!checked);
            }).addButton((btn) => {
                enableBtn = btn;
                btn.setButtonText("Enable")
                    .setCta()
                    .setDisabled(true)
                    .onClick(async () => {
                        await onConfirm();
                    });
            });
        }

        this.addCancelButton();
    }
}
