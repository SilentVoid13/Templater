import { InternalTemplateWeb } from "./InternalTemplateWeb";

export class WebRequest extends InternalTemplateWeb {
    async render() {
        // TODO
        let response = await this.getRequest(this.url);
        return response.statusText;   
    }
}