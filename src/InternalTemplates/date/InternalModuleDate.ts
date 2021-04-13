import { InternalModule } from "../InternalModule";

export class InternalModuleDate extends InternalModule {
    name = "date";

    async createStaticTemplates() {
        this.static_templates.set("now", this.generate_now());
        this.static_templates.set("tomorrow", this.generate_tomorrow());
        this.static_templates.set("weekday", this.generate_weekday());
        this.static_templates.set("yesterday", this.generate_yesterday());
    }

    async updateTemplates() {}

    generate_now() {
        return (format: string = "YYYY-MM-DD", offset?: number|string, reference?: string, reference_format?: string) => {
            if (reference && !window.moment(reference, reference_format).isValid()) {
                throw new Error("Invalid reference date format, try specifying one with the argument 'reference_format'");
            }
            let duration;
            if (typeof offset == "string") {
                duration = window.moment.duration(offset);
            }
            else if (typeof offset == "number") {
                duration = window.moment.duration(offset, "days");
            }

            return window.moment(reference, reference_format).add(duration).format(format);
        }
    }

    generate_tomorrow() {
        return (format: string = "YYYY-MM-DD") => {
            return window.moment().add(1, 'days').format(format);
        }
    }

    generate_weekday() {
        return (format: string = "YYYY-MM-DD", weekday: number, reference?: string, reference_format?: string) => {
            if (reference && !window.moment(reference, reference_format).isValid()) {
                throw new Error("Invalid reference date format, try specifying one with the argument 'reference_format'");
            }
            return window.moment(reference, reference_format).weekday(weekday).format(format);
        }
    }

    generate_yesterday() {
        return (format: string = "YYYY-MM-DD") => {
            return window.moment().add(-1, 'days').format(format);
        }
    }
}