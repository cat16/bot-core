import { path_util } from "../lib.ts";
import { Bot } from "./bot.ts";
import { Command } from "./command/command.ts";
import { load_commands } from "./command/load.ts";
import { add_module, Module } from "./module.ts";
import { CONSOLE_SERVICE } from "./service/console.ts";
import { load_services } from "./service/load.ts";
import { Service, service_from_desc } from "./service/service.ts";

export const COMMANDS_DIR = "commands";
export const SERVICES_DIR = "services";
export const MODULES_DIR = "modules";

export interface ModuleErrorCB {
    (type: "command" | "service", error: unknown): void | Promise<void>;
}

export async function load_bot(
    bot: Bot,
    dir: string,
) {
    create_dirs(dir);
    const core: Module = {
        name: "core",
        commands: [],
        services: [service_from_desc(CONSOLE_SERVICE, "console")],
    };
    add_module(bot, core);
    await Promise.all([
        load_module(bot, dir, "main"),
        load_modules(bot, path_util.join(dir, MODULES_DIR)),
    ]);
}

export async function load_modules(
    bot: Bot,
    dir: string,
) {
    const modules = [];
    for await (const entry of Deno.readDir(dir)) {
        if (!entry.isDirectory) continue;
        modules.push(
            await load_module(
                bot,
                path_util.join(dir, entry.name),
                entry.name,
            ),
        );
    }
    return modules;
}

export async function load_module(
    bot: Bot,
    dir: string,
    name: string,
) {
    let commands: Command[] = [];
    let services: Service[] = [];
    for await (const entry of Deno.readDir(dir)) {
        if (!entry.isDirectory) continue;
        switch (entry.name) {
            case COMMANDS_DIR:
                commands = await load_commands(
                    path_util.join(dir, COMMANDS_DIR),
                    e => {bot.logger.error(e)},
                );
                break;
            case SERVICES_DIR:
                services = await load_services(
                    path_util.join(dir, SERVICES_DIR),
                    e => {bot.logger.error(e)},
                );
                break;
        }
    }
    add_module(bot, {
        name,
        commands,
        services,
    });
}

export async function create_dirs(
    dir: string,
) {
    const ops = { recursive: true };
    await Deno.mkdir(path_util.join(dir, COMMANDS_DIR), ops);
    await Deno.mkdir(path_util.join(dir, SERVICES_DIR), ops);
    await Deno.mkdir(path_util.join(dir, MODULES_DIR), ops);
}
