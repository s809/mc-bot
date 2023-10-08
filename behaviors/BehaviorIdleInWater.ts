"use strict";

import { Bot } from "../env.js";

export class BehaviorIdleInWater {
    bot: Bot;
    active: boolean;
    stateName: string;
    isAttacking?: boolean;

    constructor(bot: Bot) {
        this.bot = bot;
        this.active = false;
        this.stateName = "idleInWater";
    }

    async onStateEntered() {
        this.bot.setControlState("jump", true);
    }

    onStateExited() {
        this.bot.setControlState("jump", false);
    }
}