import { globalTargets } from "../env.js";

async function follow() {
    globalTargets.followOwner = false;
    return true;
}

export const name = "unfollow";
export const func = follow;
