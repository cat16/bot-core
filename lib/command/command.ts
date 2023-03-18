import { Bot } from "../bot.ts";
import { ContextFrom, ContextList } from "./context.ts";
import { Arg, Args, ConvertedArgs } from "./arg.ts";

export interface ReplyFunc {
    (msg: string): void | unknown | Promise<void | unknown>;
}

export interface RunContext<A extends Args, CL extends ContextList> {
    args: ConvertedArgs<A>;
    rest: string;
    context: ContextFrom<CL>;
    bot: Bot;
    reply: ReplyFunc;
}

export interface RunFunc<A extends Args, CL extends ContextList> {
    (
        context: RunContext<A, CL>,
    ):
        | string
        | void
        | undefined
        | Promise<string | void | undefined>;
}

export interface Command {
    name: string;
    aliases: string[];
    args: Arg[];
    contexts: ContextList;
    run: RunFunc<Args, ContextList>;
    path: string;
}
