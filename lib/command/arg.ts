export interface ParseFunc<T> {
    (content: string): {
        status: "success";
        value: T;
    } | {
        status: "fail";
        reason: string;
    };
}

export interface Arg<T = unknown> {
    name: string;
    parse: ParseFunc<T>;
}

export interface ArgType<T = unknown> {
    parse: ParseFunc<T>;
}

export type Args = {
    [key: string]: Arg<unknown>;
};

type TypeFromArg<A extends Arg<unknown>> = A extends Arg<infer T> ? T
    : never;

export type ConvertedArgs<A extends Args> = {
    [key in keyof A]: TypeFromArg<A[key]>;
};

export function arg_type<T>(parse: ParseFunc<T>): ArgType<T> {
    return { parse };
}
