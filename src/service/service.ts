import { Bot } from "../bot.ts";
import { ServiceDescription } from "./desc.ts";

export interface Service<D = unknown> {
    name: string;
    start(bot: Bot): D | Promise<D>;
    stop?(data: D): void | Promise<void>;
    clean?(data: D): void | Promise<void>;
}

export function service_from_desc(desc: ServiceDescription, name: string) {
    return {
        name,
        start: desc.start,
    };
}
