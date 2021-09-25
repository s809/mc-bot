import minecraft_pathfinder from 'mineflayer-pathfinder';
const { Movements, goals: { GoalNear } } = minecraft_pathfinder;
import { bot } from "../env.js";

var mcData;

function prepare() {
    mcData ??= require('minecraft-data')(bot.version)
    const defaultMove = new Movements(bot, mcData);

    bot.pathfinder.setMovements(defaultMove);
}

export function goal(pos) {
    prepare();
    bot.pathfinder.setGoal(new GoalNear(pos.x, pos.y, pos.z, 3), true);
}

export async function goto(pos) {
    prepare();
    await bot.pathfinder.goto(new GoalNear(pos.x, pos.y, pos.z, 3));
}

