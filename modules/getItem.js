import { bot } from "../env.js";
import minecraftData from 'minecraft-data';

var mcData;

/**
 * Finds item in inventory.
 * 
 * @param {string} nameEnd End part of item name.
 * @returns Item, null if it's not present in inventory, or false if it doesn't exist.
 */
function findItemByName(nameEnd) {
    mcData ??= minecraftData(bot.version);

    let items = mcData.itemsArray.filter(item => item.name.endsWith(nameEnd));
    if (items.length === 0)
        return false;

    for (let item of items)
        return bot.inventory.findInventoryItem(item.id, null);

    return null;
}

export default findItemByName;
