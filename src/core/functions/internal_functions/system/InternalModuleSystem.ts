import { InternalModule } from "../InternalModule";
import { PromptModal } from "./PromptModal";
import { SuggesterModal } from "./SuggesterModal";
import { MultiSuggesterModal } from "./MultiSuggesterModal";
import { TemplaterError } from "utils/Error";
import { ModuleName } from "editor/TpDocumentation";

export class InternalModuleSystem extends InternalModule {
    public name: ModuleName = "system";

    async create_static_templates(): Promise<void> {
        this.static_functions.set("clipboard", this.generate_clipboard());
        this.static_functions.set("prompt", this.generate_prompt());
        this.static_functions.set("suggester", this.generate_suggester());
        this.static_functions.set("multi_suggester", this.generate_multi_suggester());
    }

    async create_dynamic_templates(): Promise<void> {
    }

    generate_clipboard(): () => Promise<string | null> {
        return async () => {
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

    generate_multi_suggester(): <T>(
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
            title = "Multi Suggester",
            limit?: number
        ): Promise<T[]> => {
            const multi_suggester = new MultiSuggesterModal(
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
                ) => multi_suggester.openAndGetValues(resolve, reject)
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
