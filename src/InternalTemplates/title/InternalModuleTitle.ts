import { InternalModule } from "../InternalModule";
import { TitleDate } from "./TitleDate";
import { TitleTitle } from "./TitleTitle";

export class InternalModuleTitle extends InternalModule {
    registerTemplates() {
        this.templates.set("date", TitleDate);
        this.templates.set("title", TitleTitle);
    }
}