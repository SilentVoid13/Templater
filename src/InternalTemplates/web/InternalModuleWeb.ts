import { InternalModule } from "../InternalModule";
import { WebDailyQuote } from "./WebDailyQuote";
import { WebRandomPicture } from "./WebRandomPicture";
import { WebRequest } from "./WebRequest";

export class InternalModuleWeb extends InternalModule {
    registerTemplates() {
        this.templates.set("random_picture", WebRandomPicture);
        this.templates.set("daily_quote", WebDailyQuote);
        this.templates.set("request", WebRequest);
    }
}