import {
    StateTransition,
    EntityFilters,
    NestedStateMachine,
    BehaviorGetClosestEntity,
    BehaviorMoveTo,
    BehaviorIdle,
    BehaviorFollowEntity
} from "mineflayer-statemachine";

import { bot, owner } from "../env.js";

export function createPickUpItemsState() {
    const targets = {
        entity: null,
        position: null,

        lastDistance: 0,
        standingTicks: 0,
    };

    // Follow states
    const findEntity = new BehaviorGetClosestEntity(bot, targets, entity =>
        EntityFilters().ItemDrops(entity) &&
        entity.position.distanceTo(bot.players?.[owner]?.entity.position) < 15);
    const loop = new BehaviorIdle();
    loop.stateName = "loop";
    const followEntity = new BehaviorFollowEntity(bot, targets);

    const transitions = [
        new StateTransition({
            parent: findEntity,
            child: followEntity,
            shouldTransition: () => targets.entity,
            onTransition: () => targets.position = targets.entity.position
        }),
        new StateTransition({
            parent: followEntity,
            child: findEntity,
            shouldTransition: () => {
                let distance = followEntity.distanceToTarget();

                if (distance === targets.lastDistance &&
                    !bot.targetDigBlock &&
                    targets.standingTicks++ > 5)
                    return true;
                
                targets.lastDistance = distance;
                return !distance;
            },
            onTransition: () => {
                targets.lastDistance = 0;
                targets.standingTicks = 0;
            }
        }),

        new StateTransition({
            parent: findEntity,
            child: loop,
            shouldTransition: () => !targets.entity,
        }),
        new StateTransition({
            parent: loop,
            child: findEntity,
            shouldTransition: () => true
        }),
    ];

    let stateMachine = new NestedStateMachine(transitions, findEntity);
    stateMachine.stateName = "pickUpItems";
    return stateMachine;
}