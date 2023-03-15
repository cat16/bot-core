import { Bot } from "../bot.ts";
import { context_type } from "../context/context.ts";
import { service } from "./desc.ts";

const enabled_bots: Bot[] = [];

export const STDIN_SERVICE = service({
    start(bot) {
        enabled_bots.push(bot);
        return bot;
    },
    stop(bot) {
        enabled_bots.splice(enabled_bots.indexOf(bot), 1);
    },
});

export const STDIN_CONTEXT = context_type<Record<string, never>>("stdin");

export function take_stdin() {
    const decoder = new TextDecoder();
    setTimeout(async () => {
        for await (const chunk of Deno.stdin.readable) {
            const text = decoder.decode(chunk);
            enabled_bots.forEach(async (bot) => {
                const result = await bot.handle_text({
                    bot,
                    text,
                    context: STDIN_CONTEXT.create({}),
                });
                console.log(result);
            });
        }
    });
}
