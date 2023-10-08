import { globalTargets } from "../env.js";

export const FollowCommand = {
    handler() {
        globalTargets.followOwner = !globalTargets.followOwner;

        return globalTargets.followOwner ? "following" : "not following";
    }
}
