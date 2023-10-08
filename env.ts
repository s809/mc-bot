import { Bot as BaseBot, createBot } from "mineflayer/index.js";
import { Bot as ExtendedBot } from "mineflayer";
import { dirname } from "path";
import { fileURLToPath } from "url"
import TypedEventEmitter from "typed-emitter";

import mineflayerPathfinder from 'mineflayer-pathfinder';
const { pathfinder } = mineflayerPathfinder;
import { plugin as pvp } from 'mineflayer-pvp';
import { plugin as movement } from "mineflayer-movement";

export const prefix = '!';
export const owner = "NoNick";
export const botDirectory = fileURLToPath(dirname(import.meta.url));

export type Bot = BaseBot & ExtendedBot & TypedEventEmitter<{
    attackedTarget: () => Promise<void> | void
    stoppedAttacking: () => Promise<void> | void
}>;
export const bot = createBot({
    host: "nonick.ru",
    username: "Nick",

    plugins: {
        pathfinder,
        pvp,
        movement
    }
}) as Bot;

export const globalTargets: {
    followOwner: boolean,
    currentCommand: string | null,
    args: null
} = {
    followOwner: false,
    currentCommand: null,
    args: null
};