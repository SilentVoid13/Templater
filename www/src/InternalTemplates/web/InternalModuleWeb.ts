import { TemplaterError } from "Error";
import { InternalModule } from "../InternalModule";

export class InternalModuleWeb extends InternalModule {
    name = "web";

    async createStaticTemplates() {
        this.static_templates.set("daily_quote", this.generate_daily_quote());
        this.static_templates.set("random_picture", this.generate_random_picture());
        //this.static_templates.set("get_request", this.generate_get_request());
    }
    
    async updateTemplates() {}

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

    generate_get_request() {
        return async (url: string) => {
            let response = await this.getRequest(url);
            let json = await response.json();
            return json;
        }
    }
}