import { globalTargets } from "../env.js";

async function attackMobs() {
    globalTargets.currentCommand = "attackMobs";
}

export const name = "attackmobs";
export const func = attackMobs;