import { TemplaterError } from "Error";
import { InternalModule } from "../InternalModule";

export class InternalModuleDate extends InternalModule {
    public name = "date";

    async create_static_templates(): Promise<void> {
        this.static_functions.set("now", this.generate_now());
        this.static_functions.set("tomorrow", this.generate_tomorrow());
        this.static_functions.set("weekday", this.generate_weekday());
        this.static_functions.set("yesterday", this.generate_yesterday());
    }

    async create_dynamic_templates(): Promise<void> {}

    generate_now(): (
        format?: string,
        offset?: number | string,
        reference?: string,
        reference_format?: string
    ) => string {
        return (
            format = "YYYY-MM-DD",
            offset?: number | string,
            reference?: string,
            reference_format?: string
        ) => {
            if (
                reference &&
                !window.moment(reference, reference_format).isValid()
            ) {
                throw new TemplaterError(
                    "Invalid reference date format, try specifying one with the argument 'reference_format'"
                );
            }
            let duration;
            if (typeof offset === "string") {
                duration = window.moment.duration(offset);
            } else if (typeof offset === "number") {
                duration = window.moment.duration(offset, "days");
            }

            return window
                .moment(reference, reference_format)
                .add(duration)
                .format(format);
        };
    }

    generate_tomorrow(): (format?: string) => string {
        return (format = "YYYY-MM-DD") => {
            return window.moment().add(1, "days").format(format);
        };
    }

    generate_weekday(): (
        format: string,
        weekday: number,
        reference?: string,
        reference_format?: string
    ) => string {
        return (
            format = "YYYY-MM-DD",
            weekday: number,
            reference?: string,
            reference_format?: string
        ) => {
            if (
                reference &&
                !window.moment(reference, reference_format).isValid()
            ) {
                throw new TemplaterError(
                    "Invalid reference date format, try specifying one with the argument 'reference_format'"
                );
            }
            return window
                .moment(reference, reference_format)
                .weekday(weekday)
                .format(format);
        };
    }

    generate_yesterday(): (format?: string) => string {
        return (format = "YYYY-MM-DD") => {
            return window.moment().add(-1, "days").format(format);
        };
    }
}
