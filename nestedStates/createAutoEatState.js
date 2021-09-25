import {
    StateTransition,
    BehaviorMoveTo,
    BehaviorFollowEntity,
    BehaviorLookAtEntity,
    NestedStateMachine, 
    BehaviorGetClosestEntity} from "mineflayer-statemachine";
import BehaviorAutoEat from "../behaviors/BehaviorAutoEat.js";
import BehaviorFindFoodSource from "../behaviors/BehaviorFindFoodSource.js";

import { bot, globalTargets } from "../env.js";

/**
 * Eats automatically.
 * Stops when full.
 * When out of food, tries to kill mobs if allowed.
 */
export default function createAutoEatState() {
    const targets = {};

    // Follow states
    const autoEat = new BehaviorAutoEat(bot, targets);
    const findFoodSource = new BehaviorFindFoodSource(bot, targets);
    //const findMob = new BehaviorGetClosestEntity(bot, targets, false);
    //const followPlayer = new BehaviorFollowEntity(bot, targets);
    //const moveToPlayer = new BehaviorMoveTo(bot, targets);
    //const lookAtPlayer = new BehaviorLookAtEntity(bot, targets);

    // Create our transitions
    const transitions = [
        new StateTransition({
            parent: autoEat,
            child: findFoodSource,
            shouldTransition: () => !autoEat.foodAvailable && !globalTargets.currentCommand
        }),
        //new StateTransition
    ];

    return new NestedStateMachine(transitions, findFoodSource);
}