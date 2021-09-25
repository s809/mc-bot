import {
    StateTransition,
    BehaviorMoveTo,
    BehaviorFollowEntity,
    BehaviorLookAtEntity,
    NestedStateMachine
} from "mineflayer-statemachine";
import BehaviorFindOwner from "../behaviors/BehaviorFindOwner.js";

import { bot, owner } from "../env.js";

export default function createFollowOwnerState() {
    const targets = {
        entity: null,
        position: null
    };

    // Follow states
    const findPlayer = new BehaviorFindOwner(bot, targets);
    const followPlayer = new BehaviorFollowEntity(bot, targets);
    const moveToPlayer = new BehaviorMoveTo(bot, targets);
    const lookAtPlayer = new BehaviorLookAtEntity(bot, targets);

    // Create our transitions
    const transitions = [

        // We want to start following the player immediately after finding them...
        new StateTransition({
            parent: findPlayer,
            child: followPlayer,
            shouldTransition: () => findPlayer.targets.entity,
        }),

        // (Go back to searching if player is lost)
        new StateTransition({
            parent: followPlayer,
            child: findPlayer,
            shouldTransition: () => !bot.players[owner]?.entity,
        }),

        // ...or go to last position where they were seen.
        new StateTransition({
            parent: findPlayer,
            child: moveToPlayer,
            shouldTransition: () => findPlayer.targets.position,
        }),

        // Update last known position if player is found while moving
        new StateTransition({
            parent: moveToPlayer,
            child: findPlayer,
            shouldTransition: () => bot.players[owner]?.entity,
        }),

        // If the distance to the player is less than two blocks, switch from the followPlayer
        // state to the lookAtPlayer state.
        new StateTransition({
            parent: followPlayer,
            child: lookAtPlayer,
            shouldTransition: () => followPlayer.distanceToTarget() < 2,
        }),

        // If the distance to the player is more than two blocks, switch from the lookAtPlayer
        // state to the followPlayer state.
        new StateTransition({
            parent: lookAtPlayer,
            child: followPlayer,
            shouldTransition: () => lookAtPlayer.distanceToTarget() >= 2,
        }),
    ];

    let stateMachine = new NestedStateMachine(transitions, findPlayer);
    stateMachine.stateName = "followOwner";
    return stateMachine;
}