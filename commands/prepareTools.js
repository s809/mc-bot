import { bot } from "../env.js";
import getItem from "../modules/getItem.js";
import { goto } from "../modules/goal.js";
import minecraftData from 'minecraft-data';

var mcData;

const tools = ["axe", "sword", "pickaxe", "shovel", "hoe"];

function getMissingTools(material) {
    let missingTools = [];
    for (let toolType of tools) {
        let toolName = `${material}_${toolType}`;

        if (getItem(toolName) === null)
            missingTools.push(toolName);
    }

    return missingTools;
}

async function gatherLogs() {
    const logSuffix = "log";
    let log = getItem(logSuffix);

    while (!log) {
        let block = bot.findBlock({
            matching: block => block.name.endsWith(logSuffix),
        });
        if (!block) {
            await bot.chat("There's no wood.");
            return;
        }

        await goto(block.position);
        await bot.dig(block);

        log = getItem(logSuffix);
    }

    return log;
}

async function gatherPlanks() {
    let planks = getItem("planks");
    if (!planks || planks.count < 3) {
        let log = await gatherLogs();
        if (!log) {
            bot.chat("Cannot gather planks.");
            return;
        }

        let plankType = mcData.itemsByName[`${log.name.split("_")[0]}_planks`] ?? mcData.itemsByName["planks"];
        let recipe = bot.recipesFor(plankType.id, log.metadata)[0];
        await bot.craft(recipe);
    }

    return true;
}

async function gatherSticks() {
    let sticks = getItem("stick");
    if (!sticks || sticks.count < 2) {
        if (!await gatherPlanks()) {
            bot.chat("Cannot gather sticks.");
            return;
        }

        let stickItem = mcData.itemsByName["stick"];
        let recipe = bot.recipesAll(stickItem.id)[0];
        console.log(recipe);
        await bot.craft(recipe);
    }

    return true;
}

async function prepareTools(material = "wooden") {
    mcData ??= minecraftData(bot.version);

    let missingTools = getMissingTools(material);
    if (missingTools.length === 0) {
        bot.chat("All tools are present.");
        return;
    }

    const prevState = env.state;
    env.state = prepareTools.name;

    try {
        let result = await gatherSticks();
        env.state = prevState;
        if (!result) return;
    }
    finally {
        env.state = prevState;
    }

    return true;
}

export const name = "preparetools";
export const minArgs = 0;
export const maxArgs = 1;
export const func = prepareTools;
