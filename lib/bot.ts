import { Command } from "./command/command.ts";
import { DEFAULT_TEXT_HANDLER, TextHandler } from "./handle.ts";
import { DEFAULT_LOGGER, Logger } from "./logger.ts";
import { Module } from "./module.ts";
import { Service } from "./service/service.ts";

export type CmdsWithSpaces = {
    name: string,
    command: Command
}[];

export interface Bot {
    logger: Logger
    modules: Map<string, Module>;
    enabled_services: { service: Service; data: unknown }[];
    commands: Map<string, Command>;
    command_map: Map<string, Command>;
    commands_spaces: CmdsWithSpaces;
    handle_text: TextHandler
}

export function create_bot(): Bot {
    const bot: Bot = {
        logger: DEFAULT_LOGGER,
        modules: new Map(),
        enabled_services: [],
        commands: new Map(),
        command_map: new Map(),
        commands_spaces: [],
        handle_text: DEFAULT_TEXT_HANDLER,
    };
    return bot;
}

export async function start_bot(bot: Bot) {
    // for now, just start all services
    for (
        const service of Array.from(bot.modules.values()).flatMap((m) =>
            m.services
        )
    ) {
        bot.enabled_services.push({
            service: service,
            data: await service.start(bot),
        });
    }
}

export async function stop_bot(bot: Bot) {
    for (const { service, data } of bot.enabled_services) {
        await service.stop?.(data);
    }
}
