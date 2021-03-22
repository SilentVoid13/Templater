import { InternalModule } from "../InternalModule";
import axios from 'axios';

export class InternalModuleWeb extends InternalModule {
    async registerTemplates() {
        this.templates.set("random_picture", this.generate_random_picture());
        this.templates.set("daily_quote", this.generate_daily_quote());
        this.templates.set("request", this.generate_request());
    }

    async getRequest(url: string) {
        return await axios.get(url);
    }

    generate_daily_quote() {
        return async () => {
            let response = await this.getRequest("https://quotes.rest/qod");
            let author = response.data.contents.quotes[0].author;
            let quote = response.data.contents.quotes[0].quote;
            let new_content = `> ${quote}\n> &mdash; <cite>${author}</cite>`;
            return new_content;
        }
    }

    generate_random_picture() {
        return async (size?: number, query?: string) => {
            let response = await this.getRequest(`https://source.unsplash.com/random/${size}?${query}`);
            let url = response.request.responseURL;
            return `![tp.web.random_picture](${url})`;   
        }
    }

    generate_request() {
        return async (url: string) => {
            let response = await this.getRequest(url);
            return JSON.stringify(response);
        }
    }
}