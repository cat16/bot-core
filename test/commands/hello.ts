import { command } from "../lib.ts";

export default command({
    run({ bot }) {
        bot.logger.success("hello");
    },
});
