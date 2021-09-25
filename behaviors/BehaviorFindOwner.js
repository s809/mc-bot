"use strict";

import { owner } from "../env.js";

export default class BehaviorFindOwner {
    constructor(bot, targets) {
        this.bot = bot;
        this.targets = targets;
        this.stateName = "findPlayer";

        bot.on("physicsTick", () => this.updateLastSeenPosition());
    }

    onStateEntered() {
        this.update();
    }

    update() {
        let entity = this.bot.players[owner]?.entity;
        let position;

        if (!entity)
            position = this._lastSeenPosition;

        this.targets.entity = entity;
        this.targets.position = position;
        this.isSeenPlayer = Boolean(entity || position);
    }

    updateLastSeenPosition() {
        let entity = this.bot.players[owner]?.entity;
        if (entity)
            this._lastSeenPosition = entity.position;
    }
}