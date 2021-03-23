import { InternalModule } from "../InternalModule";
import { fetch } from "popsicle";

export class InternalModuleWeb extends InternalModule {
    name = "web";

    async registerTemplates() {
        this.templates.set("random_picture", this.generate_random_picture());
        this.templates.set("daily_quote", this.generate_daily_quote());
        this.templates.set("request", this.generate_request());
    }

    async getRequest(url: string) {
        // TODO: Mobile support
        return await (await fetch(url)).text();
    }

    generate_daily_quote() {
        return async () => {
            // TODO: Mobile support
            let response = await this.getRequest("https://quotes.rest/qod");
            console.log("RESPONSE:", response);
            let author = response.data.contents.quotes[0].author;
            let quote = response.data.contents.quotes[0].quote;
            let new_content = `> ${quote}\n> &mdash; <cite>${author}</cite>`;
            return new_content;
        }
    }

    generate_random_picture() {
        return async (size?: number, query?: string) => {
            // TODO: Mobile support
            let response = await this.getRequest(`https://source.unsplash.com/random/${size}?${query}`);
            console.log("RESPONSE:", response);
            let url = response.request.responseURL;
            return `![tp.web.random_picture](${url})`;   
        }
    }

    generate_request() {
        return async (url: string) => {
            // TODO: Mobile support
            let response = await this.getRequest(url);
            return JSON.stringify(response);
        }
    }
}