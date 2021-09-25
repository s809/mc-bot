import { bot, owner } from "../../env.js";
import { goal } from "../../modules/goal.js";

async function gotoHere() {
    const target = bot.players[owner]?.entity;
    if (!target) {
        bot.chat("I don't see you!");
        return false;
    }

    goal(target.position);
    return true;
}

export const name = "here";
export const func = gotoHere;
