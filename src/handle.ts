import { Bot } from "./bot.ts";
import { Arg } from "./command/arg.ts";
import { Command, ReplyFunc } from "./command/command.ts";
import { Context } from "./context/context.ts";

export interface TextHandler {
    (data: TextHandlerInput): Promise<TextHandlerOutput>;
}

export type TextHandlerInput = {
    bot: Bot;
    text: string;
    context: Context<unknown>;
    reply: ReplyFunc;
};
export type TextHandlerOutput = {
    result: "success";
    command: Command;
    response: string | undefined;
} | {
    result: "no command" | "unknown command";
} | {
    result: "missing arguments";
    args: Arg[];
} | {
    result: "bad argument";
    reason: string;
};

export const DEFAULT_TEXT_HANDLER = async function (
    { bot, text, context, reply }: TextHandlerInput,
): Promise<TextHandlerOutput> {
    text = text.trim();
    const words = text.split(" ");
    const cmd = words.shift();

    if (cmd === undefined) {
        return { result: "no command" };
    }

    let command = bot.commands.get(cmd);

    if (command === undefined) {
        for (const { name, command: cmd2 } of bot.commands_spaces) {
            if (text.toLowerCase().startsWith(name)) {
                command = cmd2;
                words.splice(0, name.split(" ").length - 1)
                break;
            }
        }
    }

    command ??= bot.command_map.get(cmd);

    if (command === undefined) {
        return { result: "unknown command" };
    }

    // split into args respecting quotes
    const parts = words.reduce((s, c) => {
        if (!s.join) {
            if (c.startsWith('"')) {
                s.join = true;
                c = c.substring(1);
            } else if (c.startsWith('\\"')) {
                c = c.substring(1);
            }
            s.arr.push(c);
        } else {
            if (c.endsWith('\\"')) {
                c = c.slice(0, -2) + '"';
            } else if (c.endsWith('"')) {
                s.join = false;
                c = c.slice(0, -1);
            }
            s.arr[s.arr.length - 1] += " " + c;
        }
        return s;
    }, { join: false, arr: [] as string[] }).arr;

    const diff = parts.length - Object.keys(command.args).length;
    if (diff < 0) {
        return {
            result: "missing arguments",
            args: command.args.slice(parts.length),
        };
    }

    const part_itr = parts.values();
    for (const arg of command.args) {
        const part = part_itr.next().value;
        const result = arg.parse(part);
        if (result.status === "fail") {
            return {
                result: "bad argument",
                reason: result.reason,
            };
        }
    }
    const rest = Array.from(part_itr).join(" ");

    const response = await command.run({
        args: {},
        rest,
        context: context,
        bot,
        reply,
    }) ?? undefined;

    return { result: "success", response, command };
};
