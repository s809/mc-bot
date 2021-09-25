import { toggleEvalMode } from "../../env.js";

async function evalMode(msg) {
    toggleEvalMode();
    return true;
}

export const name = "evalmode";
export const func = evalMode;
