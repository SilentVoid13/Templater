import { InternalTemplateWeb } from "./InternalTemplateWeb";

export class WebDailyQuote extends InternalTemplateWeb {
    async render() {
        let response = await this.getRequest("https://quotes.rest/qod");
        let author = response.data.contents.quotes[0].author;
        let quote = response.data.contents.quotes[0].quote;
        let new_content = `> ${quote}\n> &mdash; <cite>${author}</cite>`;
        return new_content;
    }
}