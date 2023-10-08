"use strict";

import { Bot } from "../env.js";
import { Entity } from "prismarine-entity";
import { StateBehavior } from "mineflayer-statemachine";
import { synchronizeAsync } from "../modules/synchronizeAsync.js";
import { Vec3 } from "vec3";
import { Block } from "prismarine-block";

export namespace BehaviorMoveToNear {
    export interface Targets {
        entity: Entity;
    }
}

export class BehaviorMoveToNear implements StateBehavior {
    readonly distanceDecreaseWaitTimeout = 3000;

    active = false;

    bot: Bot;
    targets: BehaviorMoveToNear.Targets;
    stateName: string;

    minDistance = Infinity;
    lastDistanceDecreaseTime = Infinity;
    lastPositions: {
        bot: Vec3,
        entity: Vec3,
        time: number
    }[] = [];
    shouldFallback = false;

    constructor(bot: Bot, targets: BehaviorMoveToNear.Targets) {
        this.bot = bot;
        this.targets = targets;
        this.stateName = "moveToNear";
    }

    onStateEntered() {
        this.bot.setControlState("forward", true);
        this.bot.setControlState("sprint", true);
    }

    update = synchronizeAsync(() => this.active, async awaitWrapper => {
        const currentPos = this.bot.entity.position;

        // Jump if need
        const raycastResults = await awaitWrapper(Promise.all([
            0.5,
            1.5
        ].map(offsetY => this.bot.world.raycast(
            currentPos.offset(0, offsetY, 0),
            new Vec3(
                -Math.sin(this.bot.entity.yaw),
                0,
                -Math.cos(this.bot.entity.yaw),
            ),
            Math.max(this.targets.entity.velocity.norm(), 1)
        ))));
        const shouldJump = !!raycastResults[0] && (!raycastResults[1]
            || currentPos.xzDistanceTo((raycastResults[1] as unknown as Block).position)
                > currentPos.xzDistanceTo((raycastResults[0] as unknown as Block).position));
        this.bot.setControlState("jump", shouldJump);

        // Steer
        this.bot.movement.heuristic.get("proximity").target(this.targets.entity.position);
        const yaw = this.bot.movement.getYaw(240, 15, 1);
        this.bot.movement.steer(yaw);

        // Update last positions
        const lastEntry = {
            bot: currentPos.clone(),
            entity: this.targets.entity.position.clone(),
            time: Date.now()
        };
        this.lastPositions.push(lastEntry)
        while (this.lastPositions[0].time < Date.now() - this.distanceDecreaseWaitTimeout)
            this.lastPositions.shift();
        const firstEntry = this.lastPositions[0];

        // Get movement vectors
        const botMovementVector = lastEntry.bot.clone().subtract(firstEntry.bot);
        const entityMovementVector = lastEntry.entity.clone().subtract(firstEntry.entity);

        // Get current distance
        const currentDistance = currentPos.distanceSquared(this.targets.entity.position);

        // If both entity and bot were moving the same direction, disregard distance
        if (botMovementVector.dot(entityMovementVector) > 0) {
            this.minDistance = currentDistance;
            this.lastDistanceDecreaseTime = Date.now();
        }

        // If distance is not decreasing, set a fallback flag
        if (currentDistance < this.minDistance) {
            this.lastDistanceDecreaseTime = Date.now();
            this.minDistance = currentDistance;
        }
        if (Date.now() - this.lastDistanceDecreaseTime > this.distanceDecreaseWaitTimeout)
            this.shouldFallback = true;
    });

    reset() {
        this.minDistance = Infinity;
        this.lastDistanceDecreaseTime = Date.now();
        this.shouldFallback = false;
    }

    onStateExited() {
        this.bot.setControlState("forward", false);
        this.bot.setControlState("sprint", false);
        this.bot.setControlState("jump", false);
    }
}