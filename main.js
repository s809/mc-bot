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
import createAutoEatState from "./nestedStates/createAutoEatState.js";
import minecraft_protocol_forge from 'minecraft-protocol-forge';
import BehaviorAutoEat from './behaviors/BehaviorAutoEat.js';
const { autoVersionForge } = minecraft_protocol_forge;

bot.on("kicked", console.error);
bot.on("error", console.warn);

bot.on("end", process.exit);

bot.once('spawn', ev => {
    const pass = "botaccount";
    bot.chat(`/reg ${pass} ${pass}`);
    bot.chat(`/login ${pass}`);

    mineflayerViewer(bot, { port: 8081, firstPerson: true });

    const targets = {
        waitingForCommandToFinish: true
    }

    const idle = new BehaviorIdle();
    const followPlayer = createFollowOwnerState();
    const checkFoodAvailable = new BehaviorAutoEat(bot, targets);
    const autoEat = createAutoEatState();

    const transitions = [
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

        new StateTransition({
            parent: followPlayer,
            child: autoEat,
            shouldTransition: () => !targets.waitingForCommandToFinish, //bot.food <= 14,
        }),

        new StateTransition({
            parent: autoEat,
            child: followPlayer,
            shouldTransition: () => bot.food > 14,
        }),
    ];

    // Start state machine
    let stateMachine = new BotStateMachine(bot, new NestedStateMachine(transitions, idle));

    const webserver = new StateMachineWebserver(bot, stateMachine, 8080);
    webserver.startServer();
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
        if (await command.func(...args))
            bot.chat("ok");
        else
            bot.chat("failed");
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

    new Promise(resolve => setTimeout(resolve, 30000));
})();
