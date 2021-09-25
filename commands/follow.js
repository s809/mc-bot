import { globalTargets } from "../env.js";

async function follow() {
    globalTargets.followOwner = true;
    return true;
}

export const name = "follow";
export const func = follow;
