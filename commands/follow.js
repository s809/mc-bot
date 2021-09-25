import { globalTargets } from "../env.js";

async function follow() {
    globalTargets.followOwner = !globalTargets.followOwner;
    
    return globalTargets.followOwner ? "following" : "not following";
}

export const name = "follow";
export const func = follow;
