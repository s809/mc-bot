import { globalTargets } from "../../env.js";

async function gotoDirection() {
    globalTargets.currentCommand = "gotoDirection";
}

export const name = "direction";
export const func = gotoDirection;