"use strict";

import minecraftData from 'minecraft-data';
import { Bot } from 'mineflayer';

var mcData: minecraftData.IndexedData;

const mobFoodSources = [
    "pig",
    "sheep",
    "cow",
    "sheep",
    "zombie",
];

export default class BehaviorAutoEat {
    bot: Bot;
    targets: {};
    active: boolean;
    stateName: string;
    isUpdatePending: any;
    constructor(bot: Bot, targets: {}) {
        this.bot = bot;
        this.targets = targets;
        this.active = false;
        this.stateName = "findFoodSource";

        mcData ??= minecraftData(bot.version);
    }

    async update() {
        if (this.isUpdatePending) return;
        this.isUpdatePending = true;

        for (let food of Object.values(mcData.foodsBySaturation)) {
            let item = this.bot.inventory.findInventoryItem(food.id, null, false);
            if (item) {
                await this.bot.equip(item, "hand");
                await this.bot.consume();
            }
        }

        this.isUpdatePending = false;
    }
}