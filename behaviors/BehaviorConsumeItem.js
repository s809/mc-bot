"use strict";

const mobFoodSources = [
    "pig",
    "sheep",
    "cow",
    "sheep",
    "zombie",
];

export class BehaviorConsumeItem {
    constructor(bot, targets) {
        /** @type {import("mineflayer").Bot} */
        this.bot = bot;
        this.targets = targets;
        this.active = false;
        this.stateName = "consumeItem";
    }

    async onStateEntered() {
        this.isConsuming = true;
        if (this.bot.heldItem)
            await this.bot.consume(() => this.isConsuming = false);
        this.isConsuming = false;
    }
}