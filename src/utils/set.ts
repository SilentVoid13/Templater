export function set<T extends object>(
    obj: T,
    path: string,
    value: unknown,
): void {
    const paths = path
        .split(".")
        .map((p) => (isNaN(parseInt(p, 10)) ? p : parseInt(p, 10)));
    const lastIndex = paths.length - 1;

    let current = obj as Record<string | number, unknown>;
    for (const [i, p] of paths.entries()) {
        if (i === lastIndex) {
            current[p] = value;
        } else {
            if (current[p] == null) {
                current[p] = typeof paths[i + 1] === "number" ? [] : {};
            }
            current = current[p] as Record<string | number, unknown>;
        }
    }
}
