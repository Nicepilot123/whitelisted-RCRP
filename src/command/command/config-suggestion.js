const { SlashCommandBuilder, ChannelType, ChatInputCommandInteraction } = require('discord.js');
const GuildConfiguration = require('../../models/GuildConfiguration');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config-suggestion')
        .setDescription('Configure Suggestion Channels')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('add')
                .setDescription('Add a Suggestion Channel')
                .addChannelOption((option) =>
                    option
                        .setName('channel')
                        .setDescription('Select a text channel to add')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('remove')
                .setDescription('Remove a Suggestion Channel')
                .addChannelOption((option) =>
                    option
                        .setName('channel')
                        .setDescription('Select a text channel to remove')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
        ),

    /**
     * Executes the command.
     * @param {Object} param0
     * @param {ChatInputCommandInteraction} param0.interaction
     */
    run: async (interaction) => {

        const allowedRoles = ['1360219041028898826']

        const hasRole = allowedRoles.every(roleId => interaction.member.roles.cache.has(roleId));

        if (!hasRole){
            interaction.reply('Not Enough Permission. Missing <@&1360219041028898826> roles.')
            return;
        }   
        try {
            // Defer the reply to acknowledge the interaction
            await interaction.deferReply();

            if (!interaction.member?.permissions.has('Administrator')) {
                await interaction.editReply({
                    content: 'You do not have the required Administrator permission to use this command.',
                });
                return;
            }

            let guildConfiguration = await GuildConfiguration.findOne({ guildId: interaction.guildId });
            if (!guildConfiguration) {
                guildConfiguration = new GuildConfiguration({ guildId: interaction.guildId });
            }

            const subcommand = interaction.options.getSubcommand();
            const channel = interaction.options.getChannel('channel');

            if (subcommand === 'add') {
                if (guildConfiguration.suggestionChannelIds.includes(channel.id)) {
                    await interaction.editReply({
                        content: `${channel} is already configured as a suggestion channel.`,
                    });
                    return;
                }

                guildConfiguration.suggestionChannelIds.push(channel.id);
                await guildConfiguration.save();

                await interaction.editReply({
                    content: `Successfully added ${channel} as a suggestion channel.`,
                });
            } else if (subcommand === 'remove') {
                if (!guildConfiguration.suggestionChannelIds.includes(channel.id)) {
                    await interaction.editReply({
                        content: `${channel} is not configured as a suggestion channel.`,
                    });
                    return;
                }

                guildConfiguration.suggestionChannelIds = guildConfiguration.suggestionChannelIds.filter(
                    (id) => id !== channel.id
                );
                await guildConfiguration.save();

                await interaction.editReply({
                    content: `Successfully removed ${channel} from suggestion channels.`,
                });
            }
        } catch (error) {
            console.error('Error executing command:', error);

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: 'An error occurred while executing this command. Please try again later.',
                    ephemeral: true,
                });
            } else {
                await interaction.reply({
                    content: 'An error occurred while executing this command. Please try again later.',
                    ephemeral: true,
                });
            }
        }
    },

    options: {
        userPermission: ['Administrator'],
    },
};