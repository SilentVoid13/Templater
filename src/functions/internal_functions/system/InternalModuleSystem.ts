import { UNSUPPORTED_MOBILE_TEMPLATE } from "Constants";
import { InternalModule } from "../InternalModule";
import { Platform } from "obsidian";
import { PromptModal } from "./PromptModal";
import { SuggesterModal } from "./SuggesterModal";
import { TemplaterError } from "Error";

export class InternalModuleSystem extends InternalModule {
    public name = "system";

    async create_static_templates(): Promise<void> {
        this.static_functions.set("clipboard", this.generate_clipboard());
        this.static_functions.set("prompt", this.generate_prompt());
        this.static_functions.set("suggester", this.generate_suggester());
    }

    async create_dynamic_templates(): Promise<void> {}

    generate_clipboard(): () => Promise<string> {
        return async () => {
            // TODO: Add mobile support
            if (Platform.isMobileApp) {
                return UNSUPPORTED_MOBILE_TEMPLATE;
            }
            return await navigator.clipboard.readText();
        };
    }

    generate_prompt(): (
        prompt_text: string,
        default_value: string,
        throw_on_cancel: boolean
    ) => Promise<string> {
        return async (
            prompt_text: string,
            default_value: string,
            throw_on_cancel = false
        ): Promise<string> => {
            const prompt = new PromptModal(
                this.app,
                prompt_text,
                default_value
            );
            const promise = new Promise(
                (
                    resolve: (value: string) => void,
                    reject: (reason?: TemplaterError) => void
                ) => prompt.openAndGetValue(resolve, reject)
            );
            try {
                return await promise;
            } catch (error) {
                if (throw_on_cancel) {
                    throw error;
                }
                return null;
            }
        };
    }

    generate_suggester(): <T>(
        text_items: string[] | ((item: T) => string),
        items: T[],
        throw_on_cancel: boolean,
        placeholder: string
    ) => Promise<T> {
        return async <T>(
            text_items: string[] | ((item: T) => string),
            items: T[],
            throw_on_cancel = false,
            placeholder = ""
        ): Promise<T> => {
            const suggester = new SuggesterModal(
                this.app,
                text_items,
                items,
                placeholder
            );
            const promise = new Promise(
                (
                    resolve: (value: T) => void,
                    reject: (reason?: TemplaterError) => void
                ) => suggester.openAndGetValue(resolve, reject)
            );
            try {
                return await promise;
            } catch (error) {
                if (throw_on_cancel) {
                    throw error;
                }
                return null;
            }
        };
    }
}
