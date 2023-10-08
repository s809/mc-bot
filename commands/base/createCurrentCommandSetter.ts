import { globalTargets } from "../../env";
import { defineCommand } from "./Command";

export function createCurrentCommandSetter(name: string | null) {
    return defineCommand({
        handler() {
            globalTargets.currentCommand = name;
        }
    });
}