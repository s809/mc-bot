import { bot } from "../env.js";

async function dropall() {
    let items = bot.inventory.items();

    for (let item of items)
        await bot.tossStack(item);
}

export const name = "dropall";
export const func = dropall;
