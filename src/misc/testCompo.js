const { 
    ApplicationCommandOptionType,
    PermissionFlagsBits
} = require('discord.js');

module.exports = {
    name: 'test-component',
    description: 'Component v2 system',
    permissionsRequired: [PermissionFlagsBits.Administrator],
    botPermissions: [PermissionFlagsBits.Administrator],

    callback: async (client, interaction) => {
        const channel = await client.channels.fetch("1265330274560901212").catch(() => null);
        if (!channel) {
            return interaction.reply({ content: "❌ Channel not found!", ephemeral: true });
        }

        await channel.send({
            components: [{
                type: 1,
                components: [{
                    type: 7,  // Text with Links
                    custom_id: "coyote_encounter",
                    style: 2,
                    content: "** You have encountered a wild coyote! **\n\nWhat would you like to do?\n\n1. Pet\n2. Attempt to Feed\n3. Run Away!!"
                }]
            }, {
                type: 1,
                components: [{
                    type: 2,
                    custom_id: "pet_coyote",
                    label: "Pet it!",
                    style: 1
                }, {
                    type: 2,
                    custom_id: "feed_coyote",
                    label: "Attempt to feed it",
                    style: 2
                }, {
                    type: 2,
                    custom_id: "run_away",
                    label: "Run away!",
                    style: 4
                }]
            }]
        });

        return interaction.reply({ content: "✅ Coyote encounter sent!", ephemeral: true });
    },
};
