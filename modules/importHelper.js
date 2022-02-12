import { readdir } from "fs/promises";
import { dirname } from "path";
import { fileURLToPath } from "url";

/**
 * Converts modules to a map keyed by command names.
 * 
 * @param {any[]} modules Array of modules.
 * @returns {Map<string, import("./definitions.js").Command>} Map with command names as keys.
 */
function makeSubCommands(modules) {
    let map = new Map();

    for (let module of modules)
        map.set(module.name, module);

    return map;
}

/**
 * Imports modules in directory of {@link modulePath} as child commands.
 * Ignores index.js.
 * 
 * @param {string} modulePath Path to module.
 * @returns Imported commands.
 */
export async function importCommands(modulePath) {
    let dir = fileURLToPath(dirname(modulePath));
    let modules = [];

    for (let entry of (await readdir(dir, { withFileTypes: true }))
        .filter(entry => entry.name !== "index.js")) {

        let file = `file://${dir}/${entry.name}${entry.isDirectory() ? `/index.js` : ""}`;
        console.log(file);

        modules.push(await import(file));
    }

    return makeSubCommands(modules);
}
