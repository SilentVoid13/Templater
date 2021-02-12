import { countries, languagesAll } from 'countries-list'
import moment from 'moment';

function countryOfLocale(countryCode: string): string|null {
    // @ts-ignore
    const country = countries[countryCode.toUpperCase()];

    return country ? country.name : null;
}

function languageOfLocale(languageCode: string): string|null {
    // @ts-ignore
    const language = languagesAll[languageCode];

    return language ? language.name : null;
}

export function languageName(locale: string): string {
    const codes = locale.split('-');
    const languageName = languageOfLocale(codes[0] ?? '');
    const countryName = countryOfLocale(codes[1] ?? '');

    if (languageName && countryName) {
        return `${languageName} (${countryName})`;
    }

    if (languageName) {
        return languageName;
    }

    return locale;
}