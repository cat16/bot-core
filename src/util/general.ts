export type Obj<T = unknown> = Record<string | symbol | number, T>;
export type EmptyObj = Obj<never>;

export function is_object(obj: unknown): obj is Obj {
    return typeof obj === "object" && obj !== null;
}

export function has_own<O, P extends PropertyKey>(
    obj: O,
    prop: P,
): obj is O & Record<P, unknown> {
    return is_object(obj) && Object.hasOwn(obj, prop);
}

