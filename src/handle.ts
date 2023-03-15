import { Bot } from "./bot.ts";
import { Arg } from "./command/arg.ts";
import { Command } from "./command/command.ts";
import { Context } from "./context/context.ts";

export interface TextHandler {
    (data: TextHandlerInput): Promise<TextHandlerOutput>;
}

export type TextHandlerInput = { bot: Bot; text: string, context: Context<unknown> };
export type TextHandlerOutput = {
    result: "success";
    response: string | undefined;
} | {
    result: "no command" | "unknown command";
} | {
    result: "multiple commands";
    commands: Command[];
} | {
    result: "missing arguments";
    args: Arg[];
} | {
    result: "bad argument";
    reason: string;
};

export const DEFAULT_TEXT_HANDLER = async function (
    { bot, text, context }: TextHandlerInput,
): Promise<TextHandlerOutput> {
    text = text.trim();
    const words = text.split(" ");
    const cmd = words.shift();

    if (cmd === undefined) {
        return { result: "no command" };
    }

    let command = bot.commands.get(cmd);

    if (command === undefined) {
        const commands = bot.command_map.get(cmd) ?? [];
        if (commands.length === 0) {
            return { result: "unknown command" };
        }
        if (commands.length > 1) {
            return { result: "multiple commands", commands };
        }
        command = commands[0];
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
                reason: result.reason
            };
        }
    }
    const rest = Array.from(part_itr).join(" ");

    const response = await command.run({
        args: {},
        rest,
        context: context,
        bot
    }) ?? undefined;

    return { result: "success", response };
};
