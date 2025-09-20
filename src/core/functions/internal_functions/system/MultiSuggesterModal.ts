import { TemplaterError } from "utils/Error";
import {
    AbstractInputSuggest,
    App,
    ButtonComponent,
    Modal,
    prepareFuzzySearch,
    setIcon,
    TextComponent,
} from "obsidian";

export class MultiSuggesterModal<T> extends Modal {
    private resolve: (values: T[]) => void;
    private reject: (reason?: TemplaterError) => void;
    private submitted = false;
    private selectedItems: T[] = [];
    private listEl: HTMLDivElement;
    private suggester: InstanceType<typeof Suggester>;

    constructor(
        app: App,
        private text_items: string[] | ((item: T) => string),
        private items: T[],
        title: string,
        limit?: number
    ) {
        super(app);
        this.setTitle(title);
        this.listEl = this.contentEl.createDiv("templater-multisuggester-list");
        const inputContainer = this.contentEl.createDiv(
            "templater-multisuggester-div"
        );
        const inputComponent = new TextComponent(inputContainer);
        inputComponent.inputEl.addClass("templater-multisuggester-input");
        this.suggester = new Suggester(
            app,
            inputComponent.inputEl,
            this.getItemText.bind(this),
            items,
            limit
        ).onSelect(this.onChooseItem.bind(this));
        const buttonContainer = this.contentEl.createDiv(
            "modal-button-container"
        );
        new ButtonComponent(buttonContainer)
            .setButtonText("Save")
            .setCta()
            .onClick(() => this.save());
        new ButtonComponent(buttonContainer)
            .setButtonText("Cancel")
            .onClick(() => this.close());
    }

    onOpen(): void {
        this.display();
    }

    display(): void {
        this.listEl.empty();
        this.selectedItems.forEach((item) => {
            const itemEl = this.listEl.createDiv("mobile-option-setting-item");
            itemEl
                .createSpan("mobile-option-setting-item-name")
                .setText(this.getItemText(item));
            itemEl.createDiv(
                "clickable-icon mobile-option-setting-item-option-icon",
                (deleteEl) => {
                    setIcon(deleteEl, "lucide-x");
                    deleteEl.addEventListener("click", () => {
                        this.onRemoveItem(item);
                    });
                }
            );
        });
    }

    getItemText(item: T): string {
        if (this.text_items instanceof Function) {
            return this.text_items(item);
        }
        return (
            this.text_items[this.items.indexOf(item)] || "Undefined Text Item"
        );
    }

    onChooseItem(item: T): void {
        this.selectedItems.push(item);
        const filteredItems = this.items.filter((item) => {
            return !this.selectedItems.some(
                (selected_item) => selected_item === item
            );
        });
        this.suggester.setItems(filteredItems);
        this.display();
    }

    onRemoveItem(item: T): void {
        this.selectedItems = this.selectedItems.filter(
            (selectedItem) => selectedItem !== item
        );
        const filteredItems = this.items.filter((item) => {
            return !this.selectedItems.some(
                (selected_item) => selected_item === item
            );
        });
        this.suggester.setItems(filteredItems);
        this.display();
    }

    save(): void {
        this.submitted = true;
        this.close();
        this.resolve(this.selectedItems);
    }

    onClose(): void {
        if (!this.submitted) {
            this.reject(new TemplaterError("Cancelled prompt"));
        }
    }

    async openAndGetValue(
        resolve: (values: T[]) => void,
        reject: (reason?: TemplaterError) => void
    ): Promise<void> {
        this.resolve = resolve;
        this.reject = reject;
        this.open();
    }
}

class Suggester<T> extends AbstractInputSuggest<T> {
    constructor(
        app: App,
        textInputEl: HTMLInputElement | HTMLDivElement,
        private getItemText: (item: T) => string,
        private items: T[],
        limit?: number
    ) {
        super(app, textInputEl);
        limit && (this.limit = limit);
    }
    protected getSuggestions(query: string): T[] | Promise<T[]> {
        const q = prepareFuzzySearch(query);
        return this.items.reduce((acc, item) => {
            const itemText = this.getItemText(item);
            if (q(itemText)) {
                acc.push(item);
            }
            return acc;
        }, [] as T[]);
    }

    renderSuggestion(value: T, el: HTMLElement): void {
        el.createDiv("suggestion-content").setText(this.getItemText(value));
    }

    setItems(items: T[]) {
        this.items = items;
    }

    selectSuggestion(value: T, evt: MouseEvent | KeyboardEvent) {
        this.setValue("");
        this.close();
        super.selectSuggestion(value, evt);
    }
}
