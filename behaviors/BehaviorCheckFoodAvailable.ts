"use strict";

import minecraftData from 'minecraft-data';
import { StateBehavior } from 'mineflayer-statemachine';
import { Item } from 'prismarine-item';
import { Bot } from '../env';

var mcData: minecraftData.IndexedData;

export namespace BehaviorCheckFoodAvailable {
    export interface Targets {
        item: Item;
        alreadyCheckedFood: boolean;
        chattedNoFood: boolean;
    }
}

export class BehaviorCheckFoodAvailable implements StateBehavior {
    active = false;

    bot: Bot;
    targets: BehaviorCheckFoodAvailable.Targets;
    stateName: string;
    foodAvailable: boolean;
    foodObtainable: boolean;

    constructor(bot: Bot, targets: BehaviorCheckFoodAvailable.Targets) {
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
            let item = this.bot.inventory.findInventoryItem(food.id, null, false);

            if (item) {
                this.foodAvailable = true;
                this.targets.item = item;
                break;
            }
        }
    }
}