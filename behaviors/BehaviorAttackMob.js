"use strict";

import findItemByName from "../modules/getItem.js";

export class BehaviorAttackMob {
    constructor(bot, targets) {
        /** @type {import("mineflayer").Bot} */
        this.bot = bot;
        this.targets = targets;
        this.active = false;
        this.stateName = "attackMob";

        this.onAttackedTarget = () => this.equipBestTool();
        this.onStoppedAttacking = () => this.isAttacking = false;
    }

    equipBestTool() {
        for (let material of ["netherite", "diamond", "iron", "stone", "wooden", "golden"]) {
            for (let toolType of ["sword", "axe"]) {
                let item = findItemByName(`${material}_${toolType}`);
                if (item) {
                    this.bot.equip(item);
                    return;
                }
            }
        }
    }

    async onStateEntered() {
        this.isAttacking = true;
        
        this.equipBestTool();
        this.bot.pvp.attack(this.targets.entity);
        this.bot.on('attackedTarget', this.onAttackedTarget);
        this.bot.on("stoppedAttacking", this.onStoppedAttacking);
    }

    onStateExited() {
        this.bot.pvp.stop();
        this.bot.off('attackedTarget', this.onAttackedTarget);
        this.bot.off("stoppedAttacking", this.onStoppedAttacking);
        
        this.isAttacking = false;
    }
}