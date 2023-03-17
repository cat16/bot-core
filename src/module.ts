import { Bot } from "./bot.ts";
import { Command } from "./command/command.ts";
import { Service } from "./service/service.ts";
import { insert } from "./util/general.ts";

export interface Module {
    name: string;
    commands: Command[];
    services: Service[];
}

export function add_module(bot: Bot, module: Module) {
    // make name unique
    if (bot.modules.has(module.name)) {
        let num = 0;
        while (bot.modules.has(module.name + num)) num++;
        module.name = module.name + num;
    }
    // add
    bot.modules.set(module.name, module);
    // update command maps
    const names: string[] = [];
    for (const command of module.commands) {
        // make name unique
        if (names.includes(command.name)) {
            let num = 0;
            while (names.includes(command.name + num)) num++;
            command.name = command.name + num;
        }
        names.push(command.name);
        // add
        bot.commands.set(module.name + "." + command.name, command);
        for (
            const name of [
                command.name,
                ...command.aliases,
            ]
        ) {
            const spaces = name.includes(" ");
            if (
                spaces &&
                !bot.commands_spaces.some(({ name: n }) => n === name)
            ) {
                insert(
                    bot.commands_spaces,
                    { command, name },
                    (a, b) => a.name.length - b.name.length,
                );
                continue;
            }
            if (!spaces && !bot.command_map.has(name)) {
                bot.command_map.set(name, command);
                continue;
            }
            bot.logger.warn(
                "duplicate command name/alias '" + name +
                    "', not adding to maps",
            );
        }
    }
}
