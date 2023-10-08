"use strict";

import { Bot } from "../env";


export class BehaviorConsumeItem {
    bot: Bot;
    targets: any;
    active: boolean;
    stateName: string;
    isConsuming = false;

    constructor(bot: Bot, targets: any) {
        this.bot = bot;
        this.targets = targets;
        this.active = false;
        this.stateName = "consumeItem";
    }

    async onStateEntered() {
        this.isConsuming = true;
        if (this.bot.heldItem)
            await this.bot.consume();
        this.isConsuming = false;
    }
}