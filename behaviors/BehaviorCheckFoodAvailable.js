"use strict";

import minecraftData from 'minecraft-data';

/** @type {minecraftData.IndexedData} */
var mcData;

export class BehaviorCheckFoodAvailable {
    constructor(bot, targets) {
        this.bot = bot;
        this.targets = targets;
        this.stateName = "checkFoodAvailable";

        this.foodAvailable = false;
        this.foodObtainable = false;

        mcData ??= minecraftData(bot.version);
    }

    onStateEntered() {
        this.foodAvailable = false;

        for (let food of mcData.foodsArray) {
            let item = this.bot.inventory.findInventoryItem(food.id);

            if (item) {
                this.foodAvailable = true;
                this.targets.item = item;
                break;
            }
        }
    }
}