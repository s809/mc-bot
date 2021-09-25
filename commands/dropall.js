import { bot } from "../env.js";

async function dropall() {
    while (true) {
        let items = bot.inventory.items();
        if (!items.length) return;

        await bot.tossStack(items[0]);
    }
}

export const name = "dropall";
export const func = dropall;
