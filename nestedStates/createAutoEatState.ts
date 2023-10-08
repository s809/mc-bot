import {
    StateTransition,
    NestedStateMachine,
    BehaviorEquipItem,
    BehaviorIdle,
    StateMachineTargets
} from "mineflayer-statemachine";
import { BehaviorConsumeItem } from "../behaviors/BehaviorConsumeItem.js";

import { bot } from "../env.js";

export default function createAutoEatState(targets: StateMachineTargets) {
    const equipItem = new BehaviorEquipItem(bot, targets);
    equipItem.stateName = "equipItem";
    const consumeItem = new BehaviorConsumeItem(bot, targets);
    const finish = new BehaviorIdle();
    finish.stateName = "finish";

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