import { UNSUPPORTED_MOBILE_TEMPLATE } from "Constants";
import { InternalModule } from "InternalTemplates/InternalModule";
import { PromptModal } from "./PromptModal";

export class InternalModuleSystem extends InternalModule {
    name = "system";

    async createStaticTemplates() {
        this.static_templates.set("clipboard", this.generate_clipboard());
        this.static_templates.set("prompt", this.generate_prompt());
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
        return (prompt_text?: string, default_value?: string): Promise<string> => {
            let prompt = new PromptModal(this.app, prompt_text, default_value);
            return new Promise((resolve: (value: string) => void) => prompt.openAndGetValue(resolve));
        }
    }
}