import { UNSUPPORTED_MOBILE_TEMPLATE } from "utils/Constants";
import { InternalModule } from "../InternalModule";
import { Platform } from "obsidian";
import { PromptModal } from "./PromptModal";
import { SuggesterModal } from "./SuggesterModal";
import { MultiSelectModal } from "./MultiSelectModal";
import { TemplaterError } from "utils/Error";
import { ModuleName } from "editor/TpDocumentation";

export class InternalModuleSystem extends InternalModule {
    public name: ModuleName = "system";

    async create_static_templates(): Promise<void> {
        this.static_functions.set("clipboard", this.generate_clipboard());
        this.static_functions.set("prompt", this.generate_prompt());
        this.static_functions.set("multiselect", this.generate_multiselect());
        this.static_functions.set("suggester", this.generate_suggester());
    }

    async create_dynamic_templates(): Promise<void> {}

    generate_clipboard(): () => Promise<string | null> {
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
        throw_on_cancel: boolean,
        multi_line: boolean
    ) => Promise<string | null> {
        return async (
            prompt_text: string,
            default_value: string,
            throw_on_cancel = false,
            multi_line = false
        ): Promise<string | null> => {
            const prompt = new PromptModal(
                prompt_text,
                default_value,
                multi_line
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

    generate_multiselect(): <T>(
        text_items: string[] | ((item: T) => string),
        items: T[],
        unrestricted: boolean,
        throw_on_cancel: boolean,
        title: string,
        limit?: number
    ) => Promise<T[]> {
        return async <T>(
            text_items: string[] | ((item: T) => string),
            items: T[],
            unrestricted = false,
            throw_on_cancel = false,
            title = "Multiselect",
            limit?: number
        ): Promise<T[]> => {
            const multiselect = new MultiSelectModal(
                text_items,
                items,
                unrestricted,
                title,
                limit
            );
            const promise = new Promise(
                (
                    resolve: (values: T[]) => void,
                    reject: (reason?: TemplaterError) => void
                ) => multiselect.openAndGetValues(resolve, reject)
            );
            try {
                return await promise;
            } catch (error) {
                if (throw_on_cancel) {
                    throw error;
                }
                return [];
            }
        };
    }

    generate_suggester(): <T>(
        text_items: string[] | ((item: T) => string),
        items: T[],
        throw_on_cancel: boolean,
        placeholder: string,
        limit?: number
    ) => Promise<T> {
        return async <T>(
            text_items: string[] | ((item: T) => string),
            items: T[],
            throw_on_cancel = false,
            placeholder = "",
            limit?: number
        ): Promise<T> => {
            const suggester = new SuggesterModal(
                text_items,
                items,
                placeholder,
                limit
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
                return null as T;
            }
        };
    }
}
