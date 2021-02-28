import { get_date_string } from "../InternalUtils";
import { InternalTemplateTitle } from "./InternalTemplateTitle";

export class TitleDate extends InternalTemplateTitle {
    async render() {
        if(!window.moment(this.title, this.title_format).isValid()){
            throw new Error("Invalid title date format, try specifying one with the argument 'title_f'");
        }

        return get_date_string(this.format, this.offset, this.title, this.title_format);
    }
}