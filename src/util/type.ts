import { has_own, Obj } from "./general.ts";

// the point of this structure is to figure out whether something in a
// dynamically imported module is a type of data or not without using classes

// This could be changed to store a version string instead of just normal one,
// which would allow you to check compatibility. This would only have to be
// implemented here, and I'm trynna get this working which is why I'm leaving
// it as is for now.

export const TYPE_FIELD = "_type";

export interface Typed<N extends string> {
    [TYPE_FIELD]: N
}
export type PreTyped<T> = T extends Typed<string> ? Omit<T, typeof TYPE_FIELD> : never;

export function set_type<D extends Obj, N extends string>(data: D, name: N): D & Typed<N> {
    return {[TYPE_FIELD]: name, ...data}
}

export function is_func<T>(tname: string): (data: unknown) => data is T {
    return (data): data is T => {
        return has_own(data, TYPE_FIELD) && data[TYPE_FIELD] === tname;
    };
}
