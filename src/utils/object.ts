export const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value)

export const hasOwn = <Key extends PropertyKey>(
    value: unknown,
    key: Key,
): value is Record<Key, unknown> => isRecord(value) && Object.hasOwn(value, key)

export const omitUndefined = <T extends Record<string, unknown>>(value: T) =>
    Object.fromEntries(
        Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
    ) as {
        [K in keyof T as T[K] extends undefined ? never : K]: Exclude<T[K], undefined>
    }
