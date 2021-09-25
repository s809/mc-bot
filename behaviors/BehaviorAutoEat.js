"use strict";

import minecraftData from 'minecraft-data';

var mcData;

export default class BehaviorAutoEat {
    constructor(bot, targets) {
        this.bot = bot;
        this.targets = targets;
        this.active = true;
        this.stateName = "autoEat";

        mcData ??= minecraftData(bot.version);
    }

    onStateEntered() {
        update();
    }

    async update() {
        if (this.isUpdatePending) return;
        this.isUpdatePending = true;

        this.foodAvailable = false;
        for (let food of mcData.foodsBySaturation) {
            let item = bot.inventory.findInventoryItem(food.id);
            if (item) {
                this.foodAvailable = true;

                await bot.equip(item);
                await bot.consume();

                this.isUpdatePending = false;
                break;
            }
        }
    }
}