import { TemplaterError } from "utils/Error";
import { App, FuzzyMatch, FuzzySuggestModal } from "obsidian";

export class SuggesterModal<T> extends FuzzySuggestModal<T> {
    private resolve: (value: T) => void;
    private reject: (reason?: TemplaterError) => void;
    private submitted = false;

    constructor(
        app: App,
        private text_items: string[] | ((item: T) => string),
        private items: T[],
        placeholder: string,
        limit?: number,
        private initial_query?: string
    ) {
        super(app);
        this.setPlaceholder(placeholder);
        limit && (this.limit = limit);
    }

    getItems(): T[] {
        return this.items;
    }

    onOpen(): void {
        if (this.initial_query) {
            this.inputEl.value = this.initial_query;
            this.inputEl.dispatchEvent(new InputEvent("input"));
        }
    }

    onClose(): void {
        if (!this.submitted) {
            this.reject(new TemplaterError("Cancelled prompt"));
        }
    }

    selectSuggestion(
        value: FuzzyMatch<T>,
        evt: MouseEvent | KeyboardEvent
    ): void {
        this.submitted = true;
        this.close();
        this.onChooseSuggestion(value, evt);
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
        this.resolve(item);
    }

    async openAndGetValue(
        resolve: (value: T) => void,
        reject: (reason?: TemplaterError) => void
    ): Promise<void> {
        this.resolve = resolve;
        this.reject = reject;
        this.open();
    }
}
