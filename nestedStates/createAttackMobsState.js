import {
    StateTransition,
    EntityFilters,
    NestedStateMachine,
    BehaviorGetClosestEntity
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
    ];

    let stateMachine = new NestedStateMachine(transitions, findMob);
    stateMachine.stateName = "attackMobs";
    return stateMachine;
}