import { is_func, PreTyped, set_type, Typed } from "../util/type.ts";
import { EmptyObj } from "../util/general.ts";
import { Args } from "./arg.ts";
import { Command, RunFunc } from "./command.ts";
import { ContextList } from "./context.ts";

export const COMMAND_TYPE = "command";

export interface CommandDescription<A extends Args = Args, C extends ContextList = ContextList>
    extends Typed<typeof COMMAND_TYPE> {
    name?: string;
    aliases?: string[];
    args?: A;
    contexts?: C;
    run: RunFunc<A, C>;
}

export function command<A extends Args = EmptyObj, C extends ContextList = ContextList>(
    command: PreTyped<CommandDescription<A, C>>,
): CommandDescription<A, C> {
    return set_type(command, COMMAND_TYPE);
}

export const is_command_desc = is_func<CommandDescription>(COMMAND_TYPE);

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
