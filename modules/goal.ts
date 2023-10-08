import mineflayerPathfinder from 'mineflayer-pathfinder';
const { Movements, goals } = mineflayerPathfinder;
import { Bot, bot } from "../env.js";
import { Vec3 } from 'vec3';

export function getMovements(bot: Bot) {
    const movements = new Movements(bot);
    movements.allow1by1towers = false;
    movements.canOpenDoors = true;
    return movements;
}

function prepare() {
    bot.pathfinder.setMovements(getMovements(bot));
}

export function goal(pos: Vec3) {
    prepare();
    bot.pathfinder.setGoal(new goals.GoalNear(pos.x, pos.y, pos.z, 3), true);
}

export async function goto(pos: Vec3) {
    prepare();
    await bot.pathfinder.goto(new goals.GoalNear(pos.x, pos.y, pos.z, 3));
}

