import { requestUrl, RequestUrlResponse } from "obsidian";
import { TemplaterError } from "utils/Error";
import { InternalModule } from "../InternalModule";
import { ModuleName } from "editor/TpDocumentation";

interface DailyQuote {
    quote: string;
    author: string;
}

interface UnsplashPhoto {
    full: string;
    photog: string;
    photogUrl: string;
}

export class InternalModuleWeb extends InternalModule {
    name: ModuleName = "web";

    async create_static_templates(): Promise<void> {
        this.static_functions.set("daily_quote", this.generate_daily_quote());
        this.static_functions.set("request", this.generate_request());
        this.static_functions.set(
            "random_picture",
            this.generate_random_picture(),
        );
    }

    async create_dynamic_templates(): Promise<void> {}

    async teardown(): Promise<void> {}

    async getRequest(url: string): Promise<RequestUrlResponse> {
        try {
            const response = await requestUrl(url);
            if (response.status < 200 && response.status >= 300) {
                throw new TemplaterError("Error performing GET request");
            }
            return response;
        } catch {
            throw new TemplaterError("Error performing GET request");
        }
    }

    generate_daily_quote(): () => Promise<string> {
        return async () => {
            try {
                const response = await this.getRequest(
                    "https://raw.githubusercontent.com/Zachatoo/quotes-database/refs/heads/main/quotes.json",
                );
                const quotes = response.json as DailyQuote[];
                const random_quote =
                    quotes[Math.floor(Math.random() * quotes.length)];

                const { quote, author } = random_quote;
                const new_content = `> [!quote] ${quote}\n> — ${author}`;

                return new_content;
            } catch {
                new TemplaterError("Error generating daily quote");
                return "Error generating daily quote";
            }
        };
    }

    generate_random_picture(): (
        size: string,
        query?: string,
        include_size?: boolean,
    ) => Promise<string> {
        return async (size: string, query?: string, include_size = false) => {
            try {
                const response = await this.getRequest(
                    `https://templater-unsplash-2.fly.dev/${
                        query ? "?q=" + query : ""
                    }`,
                ).then((res) => res.json as UnsplashPhoto);
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
            } catch {
                new TemplaterError("Error generating random picture");
                return "Error generating random picture";
            }
        };
    }

    generate_request(): (url: string, path?: string) => Promise<string> {
        return async (url: string, path?: string) => {
            try {
                const response = await this.getRequest(url);
                const jsonData = response.json as Record<string, unknown>;

                if (path && jsonData) {
                    return path
                        .split(".")
                        .reduce((obj: Record<string, unknown>, key) => {
                            if (
                                Object.prototype.hasOwnProperty.call(obj, key)
                            ) {
                                return obj[key] as Record<string, unknown>;
                            } else {
                                throw new Error(
                                    `Path ${path} not found in the JSON response`,
                                );
                            }
                        }, jsonData) as unknown as string;
                }

                return jsonData as unknown as string;
            } catch (error) {
                console.error(error);
                throw new TemplaterError("Error fetching and extracting value");
            }
        };
    }
}
