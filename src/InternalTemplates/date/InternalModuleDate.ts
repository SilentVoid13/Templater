import { InternalModule } from "../InternalModule";
import { get_date_string } from "../InternalUtils";

export class InternalModuleDate extends InternalModule {
    name = "date";

    async generateTemplates() {
        this.templates.set("now", this.generate_now());
        this.templates.set("tomorrow", this.generate_tomorrow());
        this.templates.set("yesterday", this.generate_yesterday());
    }

    generate_now() {
        return (format?: string, offset?: number, reference?: string, reference_format?: string) => {
            if (reference && !window.moment(reference, reference_format).isValid()) {
                throw new Error("Invalid title date format, try specifying one with the argument 'reference'");
            }
            return get_date_string(format, offset, reference, reference_format);
        }
    }

    generate_tomorrow() {
        return (format?: string) => {
            return get_date_string(format, 1);
        }
    }

    generate_yesterday() {
        return (format?: string) => {
            return get_date_string(format, -1);
        }
    }
}