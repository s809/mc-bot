'use strict';

import { pathfinder } from 'mineflayer-pathfinder';
import armorManager from 'mineflayer-armor-manager';
import { plugin as pvp } from 'mineflayer-pvp';
import { mineflayer as mineflayerViewer } from 'prismarine-viewer';

import { bot, evalModeEnabled, globalTargets, owner, prefix } from "./env.js";
import { loadCommands, resolveCommand } from "./modules/commands.js";
import { botEval } from "./modules/eval.js";

import {
    BehaviorIdle,
    BotStateMachine,
    NestedStateMachine,
    StateTransition,
    StateMachineWebserver
} from "mineflayer-statemachine";

import createFollowOwnerState from './nestedStates/createFollowOwnerState.js';
import minecraft_protocol_forge from 'minecraft-protocol-forge';
import { BehaviorCheckFoodAvailable } from './behaviors/BehaviorCheckFoodAvailable.js';
import createAutoEatState from './nestedStates/createAutoEatState.js';
import { createAttackMobsState } from './nestedStates/createAttackMobsState.js';
import { createGotoDirectionState } from './nestedStates/createGotoDirectionState.js';

const { autoVersionForge } = minecraft_protocol_forge;

const targets = {
    alreadyCheckedFood: false,
    chattedNoFood: false
}

function chatNoFood() {
    if (!targets.chattedNoFood)
        bot.chat("I need food and I don't have any!");

    targets.chattedNoFood = true;
    targets.alreadyCheckedFood = true;
}

function afterEating() {
    targets.chattedNoFood = false;
}

bot.on("kicked", console.error);
bot.on("error", console.warn);
bot.on("end", process.exit);

bot.on("playerCollect", (collector, collected) => {
    targets.alreadyCheckedFood = false;
});

bot.once('spawn', () => {
    const pass = "botaccount";
    bot.chat(`/reg ${pass} ${pass}`);
    bot.chat(`/login ${pass}`);

    const idle = new BehaviorIdle();
    const followPlayer = createFollowOwnerState();
    const checkFoodAvailable = new BehaviorCheckFoodAvailable(bot, targets);
    const autoEat = createAutoEatState(targets);

    const attackMobs = createAttackMobsState(bot, targets);
    const gotoDirection = createGotoDirectionState(bot, targets);

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
        gotoDirection
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
            shouldTransition: () => !globalTargets.followOwner || globalTargets.currentCommand
        }),
    );

    // Start state machine
    let stateMachine = new BotStateMachine(bot, new NestedStateMachine(transitions, idle));

    const webserver = new StateMachineWebserver(bot, stateMachine, 8080);
    webserver.startServer();
    mineflayerViewer(bot, { port: 8081, firstPerson: true });
});

bot.on('chat', async (username, msg) => {
    console.log(`${username}: ${msg}`);

    // Temporary solution to prevent other players from interacting
    if (username !== owner) return;
    if (!msg.startsWith(prefix)) return;

    let args = msg.match(/[^" ]+|"(?:\\"|[^"])+"/g);
    args.forEach((str, i, arr) => {
        if (i === 0)
            str = str.slice(prefix.length);
        if (str.charAt(0) === '"')
            str = str.slice(1, -1);

        arr[i] = str;
    });

    let command = resolveCommand(args, true);

    if (!command || !command.func) {
        if (username === owner && evalModeEnabled)
            await botEval(msg);
        return;
    }

    if (args.length < command.minArgs) {
        bot.chat(`Provided arguments less than expected (need at least ${command.minArgs})`);
        return;
    }
    else if (args.length > command.maxArgs) {
        bot.chat(`Provided arguments more than expected (need at most ${command.maxArgs})`);
        return;
    }

    try {
        bot.chat(await command.func(...args) ?? "ok");
    }
    catch (e) {
        bot.chat("error");
        console.error(e.stack);
    }
});

(async () => {
    autoVersionForge(bot._client);

    await loadCommands();
    bot.loadPlugins([
        pathfinder,
        pvp,
        armorManager,
    ]);

    process.on("uncaughtException", console.error);
})();
