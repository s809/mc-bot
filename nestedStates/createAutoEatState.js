import {
    StateTransition,
    NestedStateMachine, 
    BehaviorEquipItem,
    BehaviorIdle} from "mineflayer-statemachine";
import { BehaviorConsumeItem } from "../behaviors/BehaviorConsumeItem.js";

import { bot } from "../env.js";

/**
 * Eats automatically.
 * Stops when full.
 * When out of food, tries to kill mobs if allowed.
 */
export default function createAutoEatState(targets) {
    const equipItem = new BehaviorEquipItem(bot, targets);
    equipItem.stateName = "equipItem";
    const consumeItem = new BehaviorConsumeItem(bot, targets);
    const finish = new BehaviorIdle();

    const transitions = [
        new StateTransition({
            parent: equipItem,
            child: consumeItem,
            shouldTransition: () => true
        }),
        new StateTransition({
            parent: consumeItem,
            child: finish,
            shouldTransition: () => !consumeItem.isConsuming
        })
    ];

    let stateMachine = new NestedStateMachine(transitions, equipItem, finish);
    stateMachine.stateName = "autoEat";
    return stateMachine;
}