import moment from "moment";

export function get_date_string(date_format: string, days?: number, moment_str?: string | number, moment_format?: string) {
    return moment(moment_str, moment_format).add(days, 'days').format(date_format);
}