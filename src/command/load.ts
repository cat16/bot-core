import { ErrorCB, load_mods } from "../util/reload.ts";
import { Command, command_from_desc } from "./command.ts";
import { is_command_desc } from "./desc.ts";

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
