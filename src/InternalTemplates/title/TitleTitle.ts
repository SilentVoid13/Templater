import { InternalTemplateTitle } from "./InternalTemplateTitle";

export class TitleTitle extends InternalTemplateTitle {
    async render() {
        return this.title;
    }
}