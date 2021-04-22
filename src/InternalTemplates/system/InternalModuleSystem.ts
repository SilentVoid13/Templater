import { UNSUPPORTED_MOBILE_TEMPLATE } from "Constants";
import { InternalModule } from "InternalTemplates/InternalModule";
import { PromptModal } from "./PromptModal";
import { SuggesterModal } from "./SuggesterModal";

export class InternalModuleSystem extends InternalModule {
    name = "system";

    async createStaticTemplates() {
        this.static_templates.set("clipboard", this.generate_clipboard());
        this.static_templates.set("prompt", this.generate_prompt());
        this.static_templates.set("suggester", this.generate_suggester());
    }

    async updateTemplates() {}

    generate_clipboard() {
        return async () => {
            // TODO: Add mobile support
            if (this.app.isMobile) {
                return UNSUPPORTED_MOBILE_TEMPLATE;
            }
            return await navigator.clipboard.readText();
        }
    }

    generate_prompt() {
        return async (prompt_text?: string, default_value?: string, throw_on_cancel: boolean = false): Promise<string> => {
            let prompt = new PromptModal(this.app, prompt_text, default_value);
            let promise = new Promise((resolve: (value: string) => void, reject: (reason?: any) => void) => prompt.openAndGetValue(resolve, reject));
            try {
                return await promise;
            } catch(error) {
                if (throw_on_cancel) {
                    throw error;
                }
                return null;
            }
        }
    }

    generate_suggester() {
        return async <T>(text_items: string[] | ((item: T) => string), items: T[], throw_on_cancel: boolean = false): Promise<T> => {
            let suggester = new SuggesterModal(this.app, text_items, items);
            let promise = new Promise((resolve: (value: T) => void, reject: (reason?: any) => void) => suggester.openAndGetValue(resolve, reject));
            try {
                return await promise
            } catch(error) {
                if (throw_on_cancel) {
                    throw error;
                }
                return null;
            }
        }
    }
}