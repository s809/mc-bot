export interface Command {
    minArgs?: number;
    maxArgs?: number;
    handler: (...args: any[]) => any;
}

export function defineCommand(command: Command) {
    return command;
}