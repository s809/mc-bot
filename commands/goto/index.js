import { importCommands } from "../../modules/importHelper.js";

export const name = "goto";
export const subcommands = await importCommands(import.meta.url);