import { Bot } from "../bot.ts";
import { is_func, PreTyped, set_type, Typed } from "../util/type.ts";

export const SERVICE_TYPE = "service";

export interface ServiceDescription<D = unknown>
    extends Typed<typeof SERVICE_TYPE> {
    name?: string;
    start(bot: Bot): D | Promise<D>;
    stop?(data: D): void | Promise<void>;
    clean?(data: D): void | Promise<void>;
}

export function service<D>(
    s: PreTyped<ServiceDescription<D>>,
): ServiceDescription<D> {
    return set_type(s, SERVICE_TYPE);
}

export const is_service_desc = is_func<ServiceDescription>(SERVICE_TYPE);

export function service_from_desc(desc: ServiceDescription, name: string) {
    return {
        name,
        start: desc.start,
    };
}
