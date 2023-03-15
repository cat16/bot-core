import { create_bot, load_bot, start_bot, take_stdin } from "./lib.ts";

const bot = create_bot();
await load_bot(bot, "./");
await start_bot(bot);
take_stdin();
