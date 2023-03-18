import { Bot } from "../bot.ts";

export interface Service<D = unknown> {
    name: string;
    start(bot: Bot): D | Promise<D>;
    stop?(data: D): void | Promise<void>;
    clean?(data: D): void | Promise<void>;
}
