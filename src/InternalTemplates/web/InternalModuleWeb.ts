import { InternalModule } from "../InternalModule";

export class InternalModuleWeb extends InternalModule {
    name = "web";

    async generateTemplates() {
        this.templates.set("daily_quote", this.generate_daily_quote());
        this.templates.set("random_picture", this.generate_random_picture());
        this.templates.set("request", this.generate_request());
    }

    async getRequest(url: string): Promise<Response> {
        // TODO: Mobile support
        let response = await fetch(url);
        if (!response.ok) {
            throw new Error("Error performing GET request");
        }
        return response;
    }

    generate_daily_quote() {
        return async () => {
            // TODO: Mobile support
            let response = await this.getRequest("https://quotes.rest/qod");
            let json = await response.json();

            let author = json.contents.quotes[0].author;
            let quote = json.contents.quotes[0].quote;
            let new_content = `> ${quote}\n> &mdash; <cite>${author}</cite>`;

            return new_content;
        }
    }

    generate_random_picture() {
        return async (size?: number, query?: string) => {
            // TODO: Mobile support
            let response = await this.getRequest(`https://source.unsplash.com/random/${size}?${query}`);
            let url = response.url;
            return `![tp.web.random_picture](${url})`;   
        }
    }

    generate_request() {
        return async (url: string) => {
            // TODO: Mobile support
            let response = await this.getRequest(url);
            let json = await response.json();
            console.log("JSON:", json);
            return JSON.stringify(json, null, "\t");
        }
    }
}