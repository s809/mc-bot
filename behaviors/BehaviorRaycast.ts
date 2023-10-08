"use strict";

import { Bot } from "mineflayer";
import { Entity } from "prismarine-entity";
import { Vec3 } from "vec3";

export namespace BehaviorRaycast {
    export interface Targets {
        entity: Entity;
        position: Vec3 | null;
    }
}

export class BehaviorRaycast {
    active = false;

    bot: Bot;
    targets: BehaviorRaycast.Targets;
    stateName: string;

    constructor(bot: Bot, targets: BehaviorRaycast.Targets) {
        this.bot = bot;
        this.targets = targets;
        this.stateName = "raycast";
    }

    async onStateEntered() {
        let entity = this.targets.entity;

        this.targets.position = await this.bot.world.raycast(
            entity.position.offset(0, 1.62, 0),
            new Vec3(
                -Math.cos(entity.pitch) * Math.sin(entity.yaw),
                Math.sin(entity.pitch),
                -Math.cos(entity.pitch) * Math.cos(entity.yaw),
            ),
            Infinity
        ) as Vec3 | null;
    }
}