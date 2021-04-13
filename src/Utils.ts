export function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
};

export function escapeRegExp(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}