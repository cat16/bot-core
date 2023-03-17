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

export function insert<T>(arr: T[], item: T, cmp: (a: T, b: T) => number) {
    let lb = 0;
    let ub = arr.length;
    while (ub - lb > 1) {
        const m = Math.floor((ub - lb) / 2) + lb;
        if (cmp(item, arr[m]) < 0) {
            ub = m;
        } else if (cmp(item, arr[m]) > 0) {
            lb = m;
        } else {
            arr.splice(m, 0, item);
            return;
        }
    }
    if (arr.length !== 0 && cmp(item, arr[lb]) > 0) {
        arr.splice(ub, 0, item);
        return;
    }
    arr.splice(lb, 0, item);
    return;
}
