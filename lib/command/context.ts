import { Obj } from "../util/general.ts";

export type Context<D = Obj> = D & { _type: string };
export type ContextList = readonly ContextType<Obj>[];

export type ContextFrom<L extends ContextList> = L extends readonly [
    infer C extends ContextType,
    ...infer Rest extends ContextList,
] ? C extends ContextType<infer T> ? Context<T> : never | ContextFrom<Rest>
    : L extends readonly [] ? []
    : Context;

export interface ContextType<D extends Obj = Obj> {
    create(data: D): Context<D>;
    created(context: Context<Obj>): context is Context<D>;
}

export function context_type<D extends Obj>(id: string): ContextType<D> {
    return {
        create(data: D) {
            return {
                _type: id,
                ...data,
            };
        },
        created(context): context is Context<D> {
            return context._type === id;
        },
    };
}
