'use strict';


import { bot, globalTargets, owner, prefix } from "./env.js";
import { resolveCommand } from "./modules/commands.js";

import {
    BehaviorIdle,
    BotStateMachine,
    NestedStateMachine,
    StateTransition,
    StateMachineWebserver
} from "mineflayer-statemachine";

import createFollowOwnerState from './nestedStates/createFollowOwnerState.js';
import { BehaviorCheckFoodAvailable } from './behaviors/BehaviorCheckFoodAvailable.js';
import createAutoEatState from './nestedStates/createAutoEatState.js';
import { createAttackMobsState } from './nestedStates/createAttackMobsState.js';
import { createGotoDirectionState } from './nestedStates/createGotoDirectionState.js';
import { createPickUpItemsState } from './nestedStates/createPickUpItemsState.js';
import { Item } from 'prismarine-item';
import assert from 'assert';

console.log("Imports finished");

const targets: {
    alreadyCheckedFood: boolean,
    chattedNoFood: boolean,
    item: Item | null
} = {
    alreadyCheckedFood: false,
    chattedNoFood: false,
    item: null
}

function chatNoFood() {
    if (!targets.chattedNoFood)
        bot.chat("хочу хавать");

    targets.chattedNoFood = true;
    targets.alreadyCheckedFood = true;
}

function afterEating() {
    targets.chattedNoFood = false;
}

bot.on("kicked", console.error);
bot.on("error", console.warn);
bot.on("end", () => process.exit());

process.on("uncaughtException", console.error);

bot.on("playerCollect", (collector, collected) => {
    targets.alreadyCheckedFood = false;
});

bot.once('spawn', () => {
    console.log("Bot is spawned");

    const pass = "botaccount";
    bot.chat(`/reg ${pass} ${pass}`);
    bot.chat(`/login ${pass}`);

    const idle = new BehaviorIdle();
    const followPlayer = createFollowOwnerState();
    const checkFoodAvailable = new BehaviorCheckFoodAvailable(bot, targets as BehaviorCheckFoodAvailable.Targets);
    const autoEat = createAutoEatState(targets);

    const attackMobs = createAttackMobsState();
    const gotoDirection = createGotoDirectionState();
    const pickUpItems = createPickUpItemsState();

    const { Default } = bot.movement.goals
    bot.movement.setGoal(Default);

    const transitions = [
        // Check food while idle
        new StateTransition({
            parent: idle,
            child: checkFoodAvailable,
            shouldTransition: () => bot.food <= 14 && !targets.alreadyCheckedFood
        }),
        new StateTransition({
            parent: checkFoodAvailable,
            child: idle,
            shouldTransition: () => !checkFoodAvailable.foodAvailable && !checkFoodAvailable.foodObtainable,
            onTransition: chatNoFood
        }),

        // Grab food and eat if present
        new StateTransition({
            parent: checkFoodAvailable,
            child: autoEat,
            shouldTransition: () => checkFoodAvailable.foodAvailable
        }),
        new StateTransition({
            parent: autoEat,
            child: idle,
            shouldTransition: () => autoEat.isFinished() && !globalTargets.currentCommand,
            onTransition: afterEating
        }),
    ];

    const commands = [
        attackMobs,
        gotoDirection,
        pickUpItems
    ];

    transitions.push(...commands.flatMap(state => [
        // Switch to/from command
        new StateTransition({
            parent: idle,
            child: state,
            shouldTransition: () => globalTargets.currentCommand === state.stateName,
        }),
        new StateTransition({
            parent: state,
            child: idle,
            shouldTransition: () => globalTargets.currentCommand !== state.stateName || state.isFinished(),
            onTransition: () => {
                if (globalTargets.currentCommand === state.stateName)
                    globalTargets.currentCommand = null;
            }
        }),
    ]));

    transitions.push(...[
        followPlayer,
        ...commands
    ].flatMap(state => [
        // Auto-eat while executing command
        new StateTransition({
            parent: state,
            child: checkFoodAvailable,
            shouldTransition: () => bot.food <= 14 && !targets.alreadyCheckedFood,
        }),
        new StateTransition({
            parent: checkFoodAvailable,
            child: state,
            shouldTransition: () => !checkFoodAvailable.foodAvailable && globalTargets.currentCommand === state.stateName,
            onTransition: chatNoFood
        }),
        new StateTransition({
            parent: autoEat,
            child: state,
            shouldTransition: () => autoEat.isFinished() && globalTargets.currentCommand === state.stateName,
            onTransition: afterEating
        })
    ]));

    // Follow owner
    transitions.push(
        // Following owner has lower priority compared to other stateful commands
        new StateTransition({
            parent: idle,
            child: followPlayer,
            shouldTransition: () => globalTargets.followOwner
        }),
        new StateTransition({
            parent: followPlayer,
            child: idle,
            shouldTransition: () => !globalTargets.followOwner || !!globalTargets.currentCommand
        }),
    );

    // Start state machine
    let rootState = new NestedStateMachine(transitions, idle);
    rootState.stateName = "rootState";
    let stateMachine = new BotStateMachine(bot, rootState);

    const webserver = new StateMachineWebserver(bot, stateMachine, 8080);
    webserver.startServer();
});

bot.on('chat', async (username, msg) => {
    console.log(`${username}: ${msg}`);

    // Prevent other players from interacting
    if (username !== owner) return;
    if (!msg.startsWith(prefix)) return;

    let args = msg.match(/[^" ]+|"(?:\\"|[^"])+"/g)!;
    args.forEach((str, i, arr) => {
        if (i === 0)
            str = str.slice(prefix.length);
        if (str.charAt(0) === '"')
            str = str.slice(1, -1);

        arr[i] = str;
    });

    let command = resolveCommand(args);

    if (!command) return;

    if (command.minArgs && args.length < command.minArgs) {
        bot.chat(`Provided arguments less than expected (need at least ${command.minArgs})`);
        return;
    }
    else if (command.maxArgs && args.length > command.maxArgs) {
        bot.chat(`Provided arguments more than expected (need at most ${command.maxArgs})`);
        return;
    }

    try {
        bot.chat(await command.handler(...args) ?? "ok");
    }
    catch (e) {
        assert(e instanceof Error);

        bot.chat("error");
        console.error(e.stack);
    }
});
