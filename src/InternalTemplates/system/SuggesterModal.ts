import { TemplaterError } from "Error";
import { App, FuzzyMatch, FuzzySuggestModal } from "obsidian";


export class SuggesterModal<T> extends FuzzySuggestModal<T> {
    private resolve: (value: T) => void;
    private reject: (reason?: any) => void;
    private submitted: boolean = false;

    constructor(app: App, private text_items: string[] | ((item: T) => string), private items: T[]) {
        super(app);
    }

    getItems(): T[] {
        return this.items;
    }
    
    onClose(): void {
        if (!this.submitted) {
            this.reject(new TemplaterError("Cancelled prompt"));
        }
    }

    selectSuggestion(value: FuzzyMatch<T>, evt: MouseEvent | KeyboardEvent): void {
        this.submitted = true;
        this.close();
        this.onChooseSuggestion(value, evt);
    }

    getItemText(item: T): string {
        if (this.text_items instanceof Function) {
            return this.text_items(item);
        }
        return this.text_items[this.items.indexOf(item)] || "Undefined Text Item";
    }

    onChooseItem(item: T, _evt: MouseEvent | KeyboardEvent): void {
        this.resolve(item);
    }

    async openAndGetValue(resolve: (value: T) => void, reject: (reason?: any) => void): Promise<void> {
        this.resolve = resolve;
        this.reject = reject;
        this.open();
    }
}