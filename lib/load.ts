import { path_util } from "../deps.ts";
import { Bot } from "./bot.ts";
import { Command } from "./command/command.ts";
import { load_commands } from "./command/load.ts";
import { add_module } from "./module.ts";
import { load_services } from "./service/load.ts";
import { Service } from "./service/service.ts";

export const COMMANDS_DIR = "commands";
export const SERVICES_DIR = "services";
export const MODULES_DIR = "modules";

const core_dir = path_util.join(
    new URL(".", import.meta.url).pathname,
    "../core",
);

export interface ModuleErrorCB {
    (type: "command" | "service", error: unknown): void | Promise<void>;
}

export async function load_bot(
    bot: Bot,
    path: string,
) {
    await create_dirs(path);
    await Promise.all([
        load_module(bot, core_dir, "core"),
        load_module(bot, path, "main"),
        load_modules(bot, path_util.join(path, MODULES_DIR)),
    ]);
}

export async function load_modules(
    bot: Bot,
    path: string,
) {
    const modules = [];
    for await (const entry of Deno.readDir(path)) {
        if (!entry.isDirectory) continue;
        modules.push(
            await load_module(
                bot,
                path_util.join(path, entry.name),
                entry.name,
            ),
        );
    }
    return modules;
}

export async function load_module(
    bot: Bot,
    path: string,
    name: string,
) {
    let commands: Command[] = [];
    let services: Service[] = [];
    for await (const entry of Deno.readDir(path)) {
        if (!entry.isDirectory) continue;
        switch (entry.name) {
            case COMMANDS_DIR:
                commands = await load_commands(
                    path_util.join(path, COMMANDS_DIR),
                    (e) => {
                        bot.logger.error(e);
                    },
                );
                break;
            case SERVICES_DIR:
                services = await load_services(
                    path_util.join(path, SERVICES_DIR),
                    (e) => {
                        bot.logger.error(e);
                    },
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
