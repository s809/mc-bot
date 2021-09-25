import { bot, prefix } from "../env.js";

export async function botEval(msg) {
    try {
        let response;

        try {
            try {
                response = await eval(`(async () => ${msg.substr(prefix.length)})();`);
            } catch (e) {
                if (!(e instanceof SyntaxError))
                    throw e;

                response = await eval(`(async () => { ${msg.substr(prefix.length)} })();`);
            }
        } catch (e) {
            response = e;
        }

        response = require("util").inspect(response, { depth: 1 });
        await bot.chat(response.split("\n").slice(0, 5).join("\n"));
    } catch (e) {
        console.log(e);
    }
}
