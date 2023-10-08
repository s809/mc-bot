import { bot as _bot } from "../env";
import getItem from "./getItem";
import { Vec3 } from "vec3";
const bot = _bot;

async function autoTorch() {
    while (true) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (bot.time.isDay) continue;

        let torch = getItem("torch");
        if (torch) {
            let block = bot.findBlock({
                matching: block => block.name === "torch",
                maxDistance: 7,
            });
            if (!block) {
                let refBlock = bot.findBlock({
                    matching: () => true,
                })!;

                let prevItem = bot.heldItem!;
                await bot.equip(torch, "hand");
                try {
                    await bot.placeBlock(refBlock, new Vec3(0, 1, 0));
                } catch { }
                await bot.equip(prevItem, "hand");
            }
        }
    }
};

export default autoTorch;
