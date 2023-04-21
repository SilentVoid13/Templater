import { TemplaterError } from "utils/Error";
import { InternalModule } from "../InternalModule";
import { ModuleName } from "editor/TpDocumentation";
import { DateModal } from "./DatePickerModal";

export class InternalModuleDate extends InternalModule {
    public name: ModuleName = "date";

    async create_static_templates(): Promise<void> {
        this.static_functions.set("now", this.generate_now());
        this.static_functions.set("tomorrow", this.generate_tomorrow());
        this.static_functions.set("weekday", this.generate_weekday());
        this.static_functions.set("yesterday", this.generate_yesterday());
        this.static_functions.set("date_picker", this.generate_date_picker());
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

    generate_date_picker(): (
        title: string,
        placeholder: string,
        throw_on_cancel: boolean,
    ) => Promise<string> {
        return async (
            title: string,
            format = "YYYY-MM-DD",
            throw_on_cancel = false
        ): Promise<string> => {
            const datePicker = new DateModal(
                title,
                format
            );
            const promise = new Promise(
                (
                    resolve: (value: any) => void,
                    reject: (reason?: TemplaterError) => void
                ) => datePicker.openAndGetValue(resolve, reject)
            );
            try {
                return await promise;
            } catch (error) {
                if (throw_on_cancel) {
                    throw error;
                }
                return null as any;
            }
        };
    }
}
