"use strict";

const mobFoodSources = [
    "pig",
    "sheep",
    "cow",
    "sheep",
    "zombie",
];

export class BehaviorAttackMob {
    constructor(bot, targets) {
        /** @type {import("mineflayer").Bot} */
        this.bot = bot;
        this.targets = targets;
        this.active = false;
        this.stateName = "attackMob";

        this.onStoppedAttacking = () => this.isAttacking = false;
    }

    async onStateEntered() {
        this.isAttacking = true;
        this.bot.pvp.attack(this.targets.entity);
        this.bot.on("stoppedAttacking", this.onStoppedAttacking);
    }

    onStateExited() {
        this.bot.pvp.stop();
        this.bot.off("stoppedAttacking", this.onStoppedAttacking);
        this.isAttacking = false;
    }
}