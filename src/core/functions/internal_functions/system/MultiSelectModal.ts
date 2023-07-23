import { Modal, TextComponent, fuzzySearch, prepareQuery } from "obsidian";
import { TemplaterError } from "utils/Error";

export class MultiSelectModal<T> extends Modal {
    private resolve: (values: T[]) => void;
    private reject: (reason?: TemplaterError) => void;
    private selectedItems = new Set<string>();
    private mappedItems = new Map<string, T>();
    private submitted = false;

    private SELECTOR_SELECTED = ".is-selected";
    private CLASS_SELECTED = "is-selected";

    private suggestionsContainer: HTMLDivElement;
    private chipsContainer: HTMLDivElement;
    private textInput: TextComponent;

    constructor(
        private text_items: string[] | ((item: T) => string),
        private items: T[],
        private unrestricted: boolean,
        placeholder: string,
        title: string,
        private limit?: number
    ) {
        super(app);

        // If `T` is of type `string`, then `unrestricted` is set to provided value
        // else `unrestricted` is always false
        if (items.length === 0 || typeof items[0] === "string") {
            this.unrestricted = unrestricted;
        }

        // Map each item to its text representation
        items.forEach((item) =>
            this.mappedItems.set(this.getItemText(item), item)
        );

        // Create Elements
        this.titleEl.setText(title);
        this.chipsContainer = this.contentEl.createDiv();
        this.textInput = new TextComponent(this.contentEl);
        this.textInput.setPlaceholder(placeholder);
        this.suggestionsContainer = this.contentEl.createDiv();

        // Add styles
        this.modalEl.addClass("templater-multiselect-modal");
        this.contentEl.addClass("templater-multiselect-container");
        this.chipsContainer.addClass("templater-multiselect-chips");
        this.suggestionsContainer.addClass("templater-multiselect-suggestions");
    }

    onOpen(): void {
        this.textInput.inputEl.addEventListener(
            "keydown",
            (evt: KeyboardEvent) => {
                switch (evt.key) {
                    case "Tab":
                        this.addItemFromSuggestionsOrInputField();
                        break;

                    case "Backspace":
                        if (!this.textInput.getValue()) this.removeLastItem();
                        break;

                    case "ArrowDown":
                        this.navigateSelection("DOWN");
                        break;

                    case "ArrowUp":
                        this.navigateSelection("UP");
                        break;

                    case "Enter":
                        this.submitted = true;
                        this.close();
                        break;
                }
            }
        );

        this.textInput.onChange(() => this.renderSuggestions());
        this.renderSuggestions();
    }

    addItemFromSuggestionsOrInputField() {
        const inputText = this.textInput.getValue().trim();
        const selected = this.suggestionsContainer.querySelector(
            this.SELECTOR_SELECTED
        );
        if (selected) this.addItem(selected.textContent!);
        else if (inputText && this.unrestricted) this.addItem(inputText);
    }

    addItem(value: string) {
        this.selectedItems.add(value);
        this.addChip(value);
        this.textInput.setValue("");
        this.renderSuggestions();
    }

    removeLastItem() {
        const lastChipValue = this.chipsContainer.lastElementChild?.textContent;
        if (!lastChipValue) return;
        this.selectedItems.delete(lastChipValue);
        this.removeLastChip();
        this.renderSuggestions();
    }

    addChip(value: string) {
        const chip = this.chipsContainer.createSpan({ text: value });
        chip.addClass("templater-multiselect-chip");
        chip.onClickEvent(() => {
            this.selectedItems.delete(chip.textContent!);
            this.renderSuggestions();
            chip.remove();
        });
    }

    removeLastChip() {
        const lastChip = this.chipsContainer.lastElementChild;
        lastChip?.remove();
    }

    matchText(text: string): boolean {
        const query = this.textInput.getValue();
        const preparedQuery = prepareQuery(query);
        const match = fuzzySearch(preparedQuery, text);
        const alreadySelected = this.selectedItems.has(text);
        if (match && !alreadySelected) return true;
        else return false;
    }

    matchItem(item: T): boolean {
        const text = this.getItemText(item);
        return this.matchText(text);
    }

    getItemText(item: T): string {
        if (this.text_items instanceof Function) {
            return this.text_items(item);
        }
        return (
            this.text_items[this.items.indexOf(item)] || "Undefined Text Item"
        );
    }

    getSuggestions(): string[] {
        return this.items
            .map((item) => this.getItemText(item))
            .filter((value) => this.matchText(value))
            .slice(0, this.limit ? this.limit : this.items.length);
    }

    renderSuggestion(value: string) {
        const suggestion = this.suggestionsContainer.createDiv({ text: value });
        suggestion.addClass("suggestion-item");
        suggestion.onClickEvent(() => {
            this.addChip(value);
            this.selectedItems.add(value);
            this.renderSuggestions();
        });

        suggestion.addEventListener("mouseenter", () => {
            const selectedSuggestions =
                this.suggestionsContainer.querySelectorAll(".is-selected");
            selectedSuggestions.forEach((suggestion) =>
                suggestion.removeClass(this.CLASS_SELECTED)
            );
            suggestion.addClass(this.CLASS_SELECTED);
        });
    }

    renderSuggestions() {
        this.suggestionsContainer.empty();
        const suggestions = this.getSuggestions();
        suggestions.forEach((text) => this.renderSuggestion(text));
        this.suggestionsContainer.firstElementChild?.addClass(
            this.CLASS_SELECTED
        );
    }

    navigateSelection(navigate: "UP" | "DOWN") {
        if (this.suggestionsContainer.children.length <= 1) return;
        const selected = this.suggestionsContainer.querySelector(
            this.SELECTOR_SELECTED
        );

        const nextElement = selected?.nextElementSibling;
        const previousElement = selected?.previousElementSibling;

        const firstSuggestion = this.suggestionsContainer.firstElementChild;
        const lastSuggestion = this.suggestionsContainer.lastElementChild;

        let nextSuggestion =
            navigate === "DOWN" ? nextElement : previousElement;
        if (!nextSuggestion) {
            nextSuggestion =
                navigate === "DOWN" ? firstSuggestion : lastSuggestion;
        }

        selected?.removeClass(this.CLASS_SELECTED);
        nextSuggestion?.addClass(this.CLASS_SELECTED);
        nextSuggestion?.scrollIntoView();
    }

    onClose(): void {
        if (!this.submitted) {
            this.reject(new TemplaterError("Cancelled prompt"));
        } else {
            const values: T[] = [];
            this.selectedItems.forEach((value) => {
                const item = this.mappedItems.get(value);
                if (item) values.push(item);
                else if (this.unrestricted) values.push(value as T);
            });
            this.resolve(values);
        }
    }

    async openAndGetValues(
        resolve: (values: T[]) => void,
        reject: (reason?: TemplaterError) => void
    ): Promise<void> {
        this.resolve = resolve;
        this.reject = reject;
        this.open();
    }
}
