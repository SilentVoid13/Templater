import { TemplaterError } from "Error";
import { InternalModule } from "../InternalModule";

export class InternalModuleWeb extends InternalModule {
    name = "web";

    async create_static_templates(): Promise<void> {
        this.static_functions.set("daily_quote", this.generate_daily_quote());
        this.static_functions.set(
            "random_picture",
            this.generate_random_picture()
        );
    }

    async create_dynamic_templates(): Promise<void> {}

    async getRequest(url: string): Promise<Response> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new TemplaterError("Error performing GET request");
        }
        return response;
    }

    generate_daily_quote(): () => Promise<string> {
        return async () => {
            const response = await this.getRequest("https://quotes.rest/qod");
            const json = await response.json();

            const author = json.contents.quotes[0].author;
            const quote = json.contents.quotes[0].quote;
            const new_content = `> ${quote}\n> &mdash; <cite>${author}</cite>`;

            return new_content;
        };
    }

    generate_random_picture(): (
        size: string,
        query?: string
    ) => Promise<string> {
        return async (size: string, query?: string) => {
            const response = await this.getRequest(
                `https://source.unsplash.com/random/${size ?? ""}?${
                    query ?? ""
                }`
            );
            const url = response.url;
            return `![tp.web.random_picture](${url})`;
        };
    }
}
