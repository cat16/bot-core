import { command } from "../deps.ts";

export default command({
    run({ bot }) {
        bot.logger.success("hello");
    },
});
