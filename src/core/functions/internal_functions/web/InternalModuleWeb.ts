import { TemplaterError } from "utils/Error";
import { InternalModule } from "../InternalModule";
import { ModuleName } from "editor/TpDocumentation";

export class InternalModuleWeb extends InternalModule {
    name: ModuleName = "web";

    async create_static_templates(): Promise<void> {
        this.static_functions.set("daily_quote", this.generate_daily_quote());
        this.static_functions.set("request", this.generate_request());
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
                    "https://zenquotes.io/api/today"
                );
                const json = await response.json();

                const author = json.a;
                const quote = json.q;
                const new_content = `> [!quote] ${quote}\n> — ${author}`;

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
                    `https://templater-unsplash-2.fly.dev/${
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
                    return `![photo by ${response.photog}(${response.photogUrl}) on Unsplash|${size}](${url})`;
                }
                return `![photo by ${response.photog}(${response.photogUrl}) on Unsplash](${url})`;
            } catch (error) {
                new TemplaterError("Error generating random picture");
                return "Error generating random picture";
            }
        };
    }

    generate_request(): (url: string, path?: string) => Promise<string> {
        return async (url: string, path?: string) => {
            try {
                const response = await this.getRequest(url);
                const jsonData = await response.json();

                if (path && jsonData) {
                    return path.split(".").reduce((obj, key) => {
                        if (obj && obj.hasOwnProperty(key)) {
                            return obj[key];
                        } else {
                            throw new Error(
                                `Path ${path} not found in the JSON response`
                            );
                        }
                    }, jsonData);
                }

                return jsonData;
            } catch (error) {
                console.error(error);
                throw new TemplaterError("Error fetching and extracting value");
            }
        };
    }
}
