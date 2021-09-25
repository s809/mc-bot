"use strict";

import minecraftData from 'minecraft-data';

var mcData;

const mobFoodSources = [
    "pig",
    "sheep",
    "cow",
    "sheep",
    "zombie",
];

export default class BehaviorAutoEat {
    constructor(bot, targets) {
        this.bot = bot;
        this.targets = targets;
        this.active = false;
        this.stateName = "findFoodSource";

        mcData ??= minecraftData(bot.version);
    }

    async update() {
        if (this.isUpdatePending) return;
        this.isUpdatePending = true;

        for (let food of mcData.foodsBySaturation) {
            let item = bot.inventory.findInventoryItem(food.id);
            if (item) {
                await bot.equip(item);
                await bot.consume();
            }
        }

        this.isUpdatePending = false;
    }
}