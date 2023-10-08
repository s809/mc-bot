import { bot } from "../env.js";

export const DropAllCommand = {
    async handler() {
        let items = bot.inventory.items();

        for (let item of items)
            await bot.tossStack(item);
    }
}
