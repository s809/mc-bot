import { importCommands } from "../../modules/importHelper.js";

export const name = "owner";
export const subcommands = await importCommands(import.meta.url);