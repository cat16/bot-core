import { Bot } from "../bot.ts";
import { ContextFrom, ContextList } from "../context/context.ts";
import { Arg, Args, ConvertedArgs } from "./arg.ts";
import { CommandDescription } from "./desc.ts";

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

export function command_from_desc(
    desc: CommandDescription,
    name: string,
    path: string,
): Command {
    return {
        name: desc.name ?? name,
        aliases: desc.aliases ?? [],
        args: Object.entries(desc.args ?? {}).map(([name, a]) => ({
            name,
            parse: a.parse,
        })),
        contexts: desc.contexts ?? [],
        run: desc.run,
        path,
    };
}
