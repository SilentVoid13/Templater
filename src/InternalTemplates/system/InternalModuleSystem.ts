import { InternalModule } from "InternalTemplates/InternalModule";
import { PromptModal } from "./PromptModal";

export class InternalModuleSystem extends InternalModule {
    name = "system";

    async createStaticTemplates() {
        this.static_templates.set("prompt", this.generate_prompt());
    }

    async updateTemplates() {}

    generate_prompt() {
        return (prompt_text?: string, default_value?: string): Promise<string> => {
            let prompt = new PromptModal(this.app, prompt_text, default_value);
            return new Promise((resolve: (value: string) => void) => prompt.openAndGetValue(resolve));
        }
    }
}