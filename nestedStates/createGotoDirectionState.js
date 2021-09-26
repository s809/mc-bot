import {
    StateTransition,
    BehaviorMoveTo,
    NestedStateMachine,
    BehaviorIdle
} from "mineflayer-statemachine";
import BehaviorFindOwner from "../behaviors/BehaviorFindOwner.js";
import { BehaviorRaycast } from "../behaviors/BehaviorRaycast.js";

import { bot } from "../env.js";

export function createGotoDirectionState() {
    const targets = {
        entity: null,
        position: null
    };

    const findOwner = new BehaviorFindOwner(bot, targets);
    const raycast = new BehaviorRaycast(bot, targets);
    const moveTo = new BehaviorMoveTo(bot, targets);
    const finish = new BehaviorIdle(bot, targets);
    finish.stateName = "finish";

    const transitions = [
        new StateTransition({
            parent: findOwner,
            child: raycast,
            shouldTransition: () => targets.entity,
        }),
        new StateTransition({
            parent: raycast,
            child: moveTo,
            shouldTransition: () => targets.position
        }),
        new StateTransition({
            parent: moveTo,
            child: finish,
            shouldTransition: () => moveTo.distanceToTarget() < 2
        }),

        new StateTransition({
            parent: findOwner,
            child: finish,
            shouldTransition: () => !targets.entity,
            onTransition: () => bot.chat("I don't see you!")
        }),
        new StateTransition({
            parent: raycast,
            child: finish,
            shouldTransition: () => !targets.position,
            onTransition: () => bot.chat("Point is too far away or is air.")
        }),
    ];

    let stateMachine = new NestedStateMachine(transitions, findOwner, finish);
    stateMachine.stateName = "gotoDirection";
    return stateMachine;
}