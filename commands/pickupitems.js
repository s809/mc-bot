import { globalTargets } from "../env.js";

async function pickUpItems() {
    globalTargets.currentCommand = "pickUpItems";
}

export const name = "pickupitems";
export const func = pickUpItems;