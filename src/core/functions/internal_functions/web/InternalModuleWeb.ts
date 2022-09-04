import { TemplaterError } from "utils/Error";
import { InternalModule } from "../InternalModule";
import { ModuleName } from "editor/TpDocumentation";

export class InternalModuleWeb extends InternalModule {
    name: ModuleName = "web";

    async create_static_templates(): Promise<void> {
        this.static_functions.set("daily_quote", this.generate_daily_quote());
        this.static_functions.set(
            "random_picture",
            this.generate_random_picture()
        );
    }

    async create_dynamic_templates(): Promise<void> {}

    async getRequest(url: string): Promise<Response> {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new TemplaterError("Error performing GET request");
            }
            return response;
        } catch (error) {
            throw new TemplaterError("Error performing GET request");
        }
    }

    generate_daily_quote(): () => Promise<string> {
        return async () => {
            try {
                const response = await this.getRequest(
                    "https://api.quotable.io/random"
                );
                const json = await response.json();

                const author = json.author;
                const quote = json.content;
                const new_content = `> ${quote}\n> — <cite>${author}</cite>`;

                return new_content;
            } catch (error) {
                new TemplaterError("Error generating daily quote");
                return "Error generating daily quote";
            }
        };
    }

    generate_random_picture(): (
        size: string,
        query?: string
    ) => Promise<string> {
        return async (size: string, query?: string) => {
            try {
                const response = await this.getRequest(
                    `https://source.unsplash.com/random/${size ?? ""}?${
                        query ?? ""
                    }`
                );
                const url = response.url;
                return `<img src="${url}" width="100%" height="100%" alt="tp.web.random_picture" contenteditable="false">`;
            } catch (error) {
                new TemplaterError("Error generating random picture");
                return "Error generating random picture";
            }
        };
    }
}
