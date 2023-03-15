export interface LogFn {
    (data: unknown): void;
}

export type Logger = {
    [Name in keyof typeof LOG_TYPES]: LogFn;
};

export type LoggerData = { type: LogType; data: unknown };
export type LogType = keyof typeof LOG_TYPES;

export const LOG_TYPES = {
    info: { fn: console.info, label: "color: cyan", text: "" },
    warn: { fn: console.warn, label: "color: yellow", text: "color: yellow" },
    error: { fn: console.error, label: "color: red", text: "color: red" },
    debug: { fn: console.debug, label: "color: yellow", text: "color: yellow" },
    success: { fn: console.info, label: "color: green", text: "" },
};

// don't feel like making a type checked map object funciton, if that's even possible
export const DEFAULT_LOGGER: Logger = {
    info: default_log.bind(null, "info"),
    warn: default_log.bind(null, "warn"),
    error: default_log.bind(null, "error"),
    debug: default_log.bind(null, "debug"),
    success: default_log.bind(null, "success"),
};

function default_log(type: LogType, data: unknown) {
    const t = LOG_TYPES[type];
    t.fn(
        `[%c${date_str()}%c] [%c${type}%c]: %c${data}`,
        "color: gray",
        "",
        t.label ?? "",
        "",
        t?.text ?? "",
    );
}

function date_str() {
    const date = new Date();
    return date.toLocaleDateString("ja-JP", {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
    }) + " " + date.toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}
