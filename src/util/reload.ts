import { path_util } from "../../deps.ts";
import { is_object } from "./general.ts";

const loaded_dirs = new Set();
const TEMP_DIR_PREFIX = "bot-reload";
const temp_dir = await Deno.makeTempDir({ prefix: TEMP_DIR_PREFIX });

export async function unloaded_path(path: string): Promise<string> {
    path = path_util.resolve(path);
    if (loaded_dirs.has(path)) {
        const root = path_util.parse(path).root;
        let ver = 0;
        while (loaded_dirs.has(path_util.join(temp_dir, ver.toString(), path))) ver++;
        await Deno.link(root, path_util.join(temp_dir, ver.toString()));
        path = path_util.join(temp_dir, ver.toString(), path);
    }
    loaded_dirs.add(path);
    return path;
}

export type ImportResult = {
    success: boolean,
    data: unknown
}

export async function reloadable_import(path: string): Promise<ImportResult> {
    path = await unloaded_path(path);
    try {
        return {
            success: true,
            data: await import(path)
        };
    } catch(err) {
        return {
            success: false,
            data: err
        };
    }
}

export interface ErrorCB {
    (error: unknown): void | Promise<void>;
}

export async function load_mods(
    path: string,
    error_cb: ErrorCB,
): Promise<Map<string, unknown[]>> {
    const data = new Map();
    for await (const entry of Deno.readDir(path)) {
        if (!entry.isFile) continue;
        const mpath = path_util.join(path, entry.name);
        const { success, data: mod } = await reloadable_import(mpath);
        if (!success) {
            error_cb(mod);
            continue;
        }
        if (!is_object(mod)) continue;
        const name = path_util.basename(entry.name, ".ts");
        for (const k in mod) {
            const arr = data.get(name) ?? [];
            arr.push(mod[k]);
            data.set(name, arr);
        }
    }
    return data;
}
