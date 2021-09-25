import { TemplaterError } from "Error";
import { InternalModule } from "../InternalModule";

export class InternalModuleWeb extends InternalModule {
    name = "web";

    async create_static_templates() {
        this.static_functions.set("daily_quote", this.generate_daily_quote());
        this.static_functions.set("random_picture", this.generate_random_picture());
    }
    
    async create_dynamic_templates() {}

    async getRequest(url: string): Promise<Response> {
        let response = await fetch(url);
        if (!response.ok) {
            throw new TemplaterError("Error performing GET request");
        }
        return response;
    }

    generate_daily_quote() {
        return async () => {
            let response = await this.getRequest("https://quotes.rest/qod");
            let json = await response.json();

            let author = json.contents.quotes[0].author;
            let quote = json.contents.quotes[0].quote;
            let new_content = `> ${quote}\n> &mdash; <cite>${author}</cite>`;

            return new_content;
        }
    }

    generate_random_picture() {
        return async (size: string, query?: string) => {
            let response = await this.getRequest(`https://source.unsplash.com/random/${size ?? ''}?${query ?? ''}`);
            let url = response.url;
            return `![tp.web.random_picture](${url})`;   
        }
    }
}
