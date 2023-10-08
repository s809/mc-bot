"use strict";

import { Entity } from "prismarine-entity";
import findItemByName from "../modules/getItem.js";
import { Bot } from "../env.js";

export namespace BehaviorAttackMob {
    export interface Targets {
        entity: Entity;
    }
}

export class BehaviorAttackMob {
    bot: Bot;
    targets: BehaviorAttackMob.Targets;
    active: boolean;
    stateName: string;
    onAttackedTarget: () => void;
    onStoppedAttacking: () => void;
    isAttacking?: boolean;

    constructor(bot: Bot, targets: BehaviorAttackMob.Targets) {
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
                    this.bot.equip(item, "hand");
                    return;
                }
            }
        }
    }

    async onStateEntered() {
        this.isAttacking = true;

        this.equipBestTool();
        this.bot.pvp.attack(this.targets.entity);
        this.bot.on("attackedTarget", this.onAttackedTarget);
        this.bot.on("stoppedAttacking", this.onStoppedAttacking);
    }

    onStateExited() {
        this.bot.pvp.stop();
        this.bot.off("attackedTarget", this.onAttackedTarget);
        this.bot.off("stoppedAttacking", this.onStoppedAttacking);

        this.isAttacking = false;
    }
}