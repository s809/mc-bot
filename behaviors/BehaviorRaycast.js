"use strict";

import vec3 from "vec3";
const { Vec3 } = vec3;

export class BehaviorRaycast {
    constructor(bot, targets) {
        /** @type {import("mineflayer").Bot} */
        this.bot = bot;
        this.targets = targets;
        this.stateName = "raycast";
    }

    onStateEntered() {
        /** @type {import("prismarine-entity").Entity} */
        let entity = this.targets.entity;

        this.targets.position = this.bot.world.raycast(
            entity.position,
            new Vec3(
                -Math.cos(entity.pitch) * Math.sin(entity.yaw),
                Math.sin(entity.pitch),
                -Math.cos(entity.pitch) * Math.cos(entity.yaw),
            )
        ).position;
    }
}