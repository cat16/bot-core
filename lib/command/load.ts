import { ErrorCB, load_mods } from "../util/reload.ts";
import { Command } from "./command.ts";
import { command_from_desc, is_command_desc } from "./desc.ts";

export async function load_commands(
    path: string,
    error_cb: ErrorCB,
): Promise<Command[]> {
    const cmds: Command[] = [];
    for (const [name, ds] of await load_mods(path, error_cb)) {
        for (const d of ds) {
            if (!is_command_desc(d)) continue;
            cmds.push(command_from_desc(d, name, path));
        }
    }
    return cmds;
}
