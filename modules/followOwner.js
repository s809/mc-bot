const env = require("../env");
const { goal } = require("./goal");
const bot = env.bot;

var attackedEntity;
var lastOwnerPosition;

async function followOwner() {
    const attackDistance = 10;
    const stopAttackDistance = 15;
    const loopInterval = 2000;

    while (true) {
        await new Promise(resolve => setTimeout(resolve, loopInterval));
        if (env.state != followOwner.name) {
            if (attackedEntity)
                bot.pvp.stop();
            continue;
        }

        let owner = bot.players?.[env.owner]?.entity;

        if (owner) {
            if (attackedEntity) {
                if (attackedEntity.position.distanceTo(owner.position) > stopAttackDistance)
                    bot.pvp.stop();
            }
            else {
                let entity = bot.nearestEntity(e =>
                    e.type === 'mob' &&
                    e.mobType !== 'Armor Stand' &&
                    e.position.distanceTo(owner.position) < attackDistance);

                if (entity) {
                    attackedEntity = entity;
                    bot.pvp.attack(entity);
                }
                else {
                    lastOwnerPosition = owner.position;
                    goal(owner.position);
                }
            }
        }
        else if (lastOwnerPosition) {
            goal(lastOwnerPosition);
        }
    }
};

bot.on('stoppedAttacking', () => {
    attackedEntity = null;
})


module.exports = followOwner;
