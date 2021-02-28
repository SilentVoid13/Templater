import { InternalTemplateWeb } from "./InternalTemplateWeb";

export class WebRandomPicture extends InternalTemplateWeb {
    async render() {
        let response = await this.getRequest(`https://source.unsplash.com/random/${this.size}?${this.query}`);
        let url = response.request.responseURL;
        return `![tp.web.random_picture](${url})`;   
    }
}