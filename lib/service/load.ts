import { ErrorCB, load_mods } from "../util/reload.ts";
import { is_service_desc, service_from_desc } from "./desc.ts";
import { Service } from "./service.ts";

export async function load_services(
    path: string,
    error_cb: ErrorCB,
): Promise<Service[]> {
    const services: Service[] = [];
    for (const [name, ds] of await load_mods(path, error_cb)) {
        for (const d of ds) {
            if (!is_service_desc(d)) continue;
            services.push(service_from_desc(d, name));
        }
    }
    return services;
}
