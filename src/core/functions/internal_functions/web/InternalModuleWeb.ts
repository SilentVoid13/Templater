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

    async teardown(): Promise<void> {}

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
        query?: string,
        include_size?: boolean
    ) => Promise<string> {
        return async (size: string, query?: string, include_size = false) => {
            try {
                const response = await this.getRequest(
                    `https://templater-unsplash.fly.dev/${
                        query ? "?q=" + query : ""
                    }`
                ).then((res) => res.json());
                let url = response.full;
                if (size && !include_size) {
                    if (size.includes("x")) {
                        const [width, height] = size.split("x");
                        url = url.concat(`&w=${width}&h=${height}`);
                    } else {
                        url = url.concat(`&w=${size}`);
                    }
                }
                if (include_size) {
                    return `![photo by ${response.photog} on Unsplash|${size}](${url})`;
                }
                return `![photo by ${response.photog} on Unsplash](${url})`;
            } catch (error) {
                new TemplaterError("Error generating random picture");
                return "Error generating random picture";
            }
        };
    }
}
