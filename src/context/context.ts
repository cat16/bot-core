import { Obj } from "../util/general.ts";

export type Context<D = unknown> = D & { _type: symbol };
export type ContextList = readonly ContextType<Obj>[];

export type ContextFrom<L extends ContextList> = L extends readonly [
    infer C extends ContextType,
    ...infer Rest extends ContextList,
] ? C extends ContextType<infer T> ? Context<T> : never | ContextFrom<Rest>
    : L extends readonly [] ? []
    : Context;

export interface ContextType<D extends Obj = Obj> {
    create(data: D): Context<D>;
    is(context: Context<Obj>): context is Context<D>;
}

export function context_type<D extends Obj>(): ContextType<D> {
    const type = Symbol();
    return {
        create(data: D) {
            return {
                _type: type,
                ...data,
            };
        },
        is(context): context is Context<D> {
            return context._type === type;
        },
    };
}
