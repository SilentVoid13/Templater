import { get_date_string } from "../InternalUtils";
import { InternalTemplateDate } from "./InternalTemplateDate";

export class DateYesterday extends InternalTemplateDate {
    async render() {
        return get_date_string(this.format, -1);
    }
}