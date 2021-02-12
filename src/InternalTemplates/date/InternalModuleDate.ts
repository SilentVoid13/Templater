import { InternalModule } from "../InternalModule";
import { DateNow } from "./DateNow";
import { DateTomorrow } from "./DateTomorrow";
import { DateYesterday } from "./DateYesterday";

export class InternalModuleDate extends InternalModule {
    registerTemplates() {
        this.templates.set("now", DateNow);
        this.templates.set("tomorrow", DateTomorrow);
        this.templates.set("yesterday", DateYesterday);
    }
}