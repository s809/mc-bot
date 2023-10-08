/**
 * @file Module for importing all commands.
 */

import { Command } from "../commands/base/Command.js";
import { AttackModsCommand } from "../commands/AttackMobsCommand.js";
import { DropAllCommand } from "../commands/DropAllCommand.js";
import { FollowCommand } from "../commands/FollowCommand.js";
import { GotoDirectionCommand } from "../commands/GotoDirectionCommand.js";
import { PickUpItemsCommand } from "../commands/PickUpItemsCommand.js";
import { PrepareToolsCommand } from "../commands/PrepareToolsCommand.js";
import { StopCommand } from "../commands/StopCommand.js";

var commands: [string, Command][] = [
    ["attackmobs", AttackModsCommand],
    ["dropall", DropAllCommand],
    ["follow", FollowCommand],
    ["gotodirection", GotoDirectionCommand],
    ["pickupitems", PickUpItemsCommand],
    ["preparetools", PrepareToolsCommand],
    ["stop", StopCommand],
];

export function resolveCommand(path: string | string[]) {
    if (!Array.isArray(path))
        path = path.split("/");

    return commands.find(x => x[0] === path[0])?.[1] ?? null;
}
