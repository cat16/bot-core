import { Bot } from "./bot.ts";
import { Command } from "./command/command.ts";
import { Service } from "./service/service.ts";

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
        for (const name of [
            command.name,
            ...command.aliases
        ]) {
            const arr = bot.command_map.get(name) ?? [];
            arr.push(command);
            bot.command_map.set(name, arr);
        }
    }
}

export function remove_module(bot: Bot, module: Module) {
    let name = module.name;
    if (bot.modules.has(name)) {
        let num = 0;
        while (bot.modules.has(name + num)) num++;
        name = name + num;
    }
    bot.modules.set(name, module);
    for (const command of module.commands) {
        let full = name + "." + command.name;
        if (bot.commands.has(full)) {
            let num = 0;
            while (bot.modules.has(full + num)) num++;
            full = full + num;
        }
        bot.commands.set(full, command);

        for (const name of [
            command.name,
            ...command.aliases
        ]) {
            const arr = bot.command_map.get(name) ?? [];
            arr.push(command);
            bot.command_map.set(name, arr);
        }
    }
}
