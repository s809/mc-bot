import { dirname } from "path";
import { fileURLToPath } from "url"
import mineflayer from "mineflayer";

export const prefix = '!';
export const owner = "NoNick";
export const botDirectory = fileURLToPath(dirname(import.meta.url));

export const bot = mineflayer.createBot({
    host: "130.61.57.25",
    port: 25566,
    username: "Nick",
});

export var evalModeEnabled = false;
export function toggleEvalMode() {
    evalModeEnabled = !evalModeEnabled;
}

export const globalTargets = {
    followOwner: false,
    currentCommand: null,
    args: null
};