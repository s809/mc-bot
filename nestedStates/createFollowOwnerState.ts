import {
    StateTransition,
    BehaviorMoveTo,
    BehaviorFollowEntity,
    BehaviorLookAtEntity,
    NestedStateMachine,
    StateMachineTargets
} from "mineflayer-statemachine";
import { BehaviorFindOwner } from "../behaviors/BehaviorFindOwner.js";

import { bot, owner } from "../env.js";
import { getMovements } from "../modules/goal.js";
import { BehaviorMoveToNear } from "../behaviors/BehaviorMoveToNear";

export default function createFollowOwnerState() {
    const targets: StateMachineTargets | BehaviorFindOwner.Targets | BehaviorMoveToNear.Targets = {
        entity: undefined,
        position: undefined
    };

    // Follow states
    const findOwner = new BehaviorFindOwner(bot, targets as BehaviorFindOwner.Targets);
    const followPlayer = new BehaviorFollowEntity(bot, targets);
    followPlayer.movements = getMovements(bot);
    const moveToPlayer = new BehaviorMoveTo(bot, targets);
    (moveToPlayer.movements as any) = getMovements(bot);
    const followPlayerNear = new BehaviorMoveToNear(bot, targets as BehaviorMoveToNear.Targets);
    const lookAtPlayer = new BehaviorLookAtEntity(bot, targets);

    // Create our transitions
    const transitions = [

        // We want to start following the player immediately after finding them...
        new StateTransition({
            parent: findOwner,
            child: followPlayerNear,
            shouldTransition: () => !!findOwner.targets.entity,
        }),

        // (Go back to searching if player is lost)
        new StateTransition({
            parent: followPlayerNear,
            child: findOwner,
            shouldTransition: () => !bot.players[owner]?.entity,
        }),

        // ...or go to last position where they were seen.
        new StateTransition({
            parent: findOwner,
            child: moveToPlayer,
            shouldTransition: () => !!findOwner.targets.position,
        }),

        // Update last known position if player is found while moving
        new StateTransition({
            parent: moveToPlayer,
            child: findOwner,
            shouldTransition: () => !!bot.players[owner]?.entity,
        }),

        // Fallback to pathfinding temporarily if stuck
        new StateTransition({
            parent: followPlayerNear,
            child: followPlayer,
            shouldTransition: () => followPlayerNear.shouldFallback,
            onTransition: () => setTimeout(() => followPlayerNear.reset(), 10000)
        }),
        new StateTransition({
            parent: followPlayer,
            child: followPlayerNear,
            shouldTransition: () => !followPlayerNear.shouldFallback
        }),

        // If close enough to the player, stare at them
        new StateTransition({
            parent: followPlayerNear,
            child: lookAtPlayer,
            shouldTransition: () => followPlayer.distanceToTarget() < 2,
            onTransition: () => followPlayerNear.reset()
        }),
        new StateTransition({
            parent: followPlayer,
            child: lookAtPlayer,
            shouldTransition: () => followPlayer.distanceToTarget() < 2,
            onTransition: () => followPlayerNear.reset()
        }),

        // If player went far enough, go after them
        new StateTransition({
            parent: lookAtPlayer,
            child: followPlayerNear,
            shouldTransition: () => lookAtPlayer.distanceToTarget() >= 4,
        }),
    ];

    let stateMachine = new NestedStateMachine(transitions, findOwner);
    stateMachine.stateName = "followOwner";
    return stateMachine;
}