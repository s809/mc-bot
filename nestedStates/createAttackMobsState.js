import {
    StateTransition,
    EntityFilters,
    NestedStateMachine,
    BehaviorGetClosestEntity,
    BehaviorIdle
} from "mineflayer-statemachine";
import { BehaviorAttackMob } from "../behaviors/BehaviorAttackMob.js";

import { bot, owner } from "../env.js";

const excludedMobs = [
    "player",

    // Useful mobs
    "villager",
    "wolf",
    "cat",
    "parrot",

    // Good underwater
    "axolotl",
    "glow_squid",

    // Flying
    "bat",
    "bee"
]

export function createAttackMobsState() {
    const targets = {
        entity: null
    };

    // Follow states
    const findMob = new BehaviorGetClosestEntity(bot, targets, entity =>
        EntityFilters().MobsOnly(entity) &&
        !excludedMobs.includes(entity.name) &&
        entity.position.distanceTo(bot.players?.[owner]?.entity.position) < 15);
    const loop = new BehaviorIdle();
    loop.stateName = "loop";
    const attackMob = new BehaviorAttackMob(bot, targets);

    // Create our transitions
    const transitions = [
        new StateTransition({
            parent: findMob,
            child: attackMob,
            shouldTransition: () => targets.entity
        }),
        new StateTransition({
            parent: attackMob,
            child: findMob,
            shouldTransition: () => !attackMob.isAttacking
        }),

        new StateTransition({
            parent: findMob,
            child: loop,
            shouldTransition: () => !targets.entity,
        }),
        new StateTransition({
            parent: loop,
            child: findMob,
            shouldTransition: () => true
        }),
    ];

    let stateMachine = new NestedStateMachine(transitions, findMob);
    stateMachine.stateName = "attackMobs";
    return stateMachine;
}