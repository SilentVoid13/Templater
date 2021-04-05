export function get_date_string(date_format: string, days?: number, moment_str?: string | number, moment_format?: string) {
    return window.moment(moment_str, moment_format).add(days, 'days').format(date_format);
}

export const UNSUPPORTED_MOBILE_TEMPLATE = "Error_MobileUnsupportedTemplate";