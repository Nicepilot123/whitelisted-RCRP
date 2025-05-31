const { ActivityType } = require("discord.js");

module.exports = async (client) => {
    const guildId = "1265327493813112852";
    const guild = await client.guilds.fetch(guildId);

    const members = await guild.members.fetch();

    client.user.setActivity(`${members.size} Members 🎧`, {type: ActivityType.Watching });
}