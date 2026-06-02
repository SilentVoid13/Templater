export type Paths<T> = T extends object
    ? {
          [K in keyof T & string]: K | `${K}.${Paths<T[K]>}`;
      }[keyof T & string]
    : never;

type PathValue<T, P extends string> = P extends `${infer K}.${infer R}`
    ? K extends keyof T
        ? PathValue<T[K], R>
        : never
    : P extends keyof T
    ? T[P]
    : never;

export function get<T extends object, P extends Paths<T>>(
    obj: T,
    path: P & string,
    defaultValue?: PathValue<T, P & string>,
): PathValue<T, P & string> | undefined {
    const result = (path as string)
        .split(".")
        .reduce(
            (acc: unknown, key) =>
                (acc as Record<string, unknown>)?.[key],
            obj,
        );
    return (result === undefined ? defaultValue : result) as PathValue<
        T,
        P & string
    >;
}
