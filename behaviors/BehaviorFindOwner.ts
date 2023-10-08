"use strict";

import { Bot, owner } from "../env.js";
import { Vec3 } from "vec3";
import { Entity } from "prismarine-entity";
import { StateBehavior } from "mineflayer-statemachine";

export namespace BehaviorFindOwner {
    export interface Targets {
        entity: Entity;
        position?: Vec3;
    }
}

export class BehaviorFindOwner implements StateBehavior {
    active = false;

    bot: Bot;
    targets: BehaviorFindOwner.Targets;
    stateName: string;
    _lastSeenPosition?: Vec3;
    isSeenPlayer = false;

    constructor(bot: Bot, targets: BehaviorFindOwner.Targets) {
        this.bot = bot;
        this.targets = targets;
        this.stateName = "findPlayer";

        bot.on("physicsTick", () => this.updateLastSeenPosition());
    }

    onStateEntered() {
        this.update();
    }

    update() {
        let entity = this.bot.players[owner]?.entity;
        let position;

        if (!entity)
            position = this._lastSeenPosition;

        this.targets.entity = entity;
        this.targets.position = position;
        this.isSeenPlayer = Boolean(entity || position);
    }

    updateLastSeenPosition() {
        let entity = this.bot.players[owner]?.entity;
        if (entity)
            this._lastSeenPosition = entity.position;
    }
}