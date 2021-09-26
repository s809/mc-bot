import { globalTargets } from "../env.js";

async function stop() {
    globalTargets.currentCommand = null;
}

export const name = "stop";
export const func = stop;