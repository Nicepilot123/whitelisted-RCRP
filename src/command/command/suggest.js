const {
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder,
    ChannelType,
} = require('discord.js');
const Suggestion = require('../../models/Suggestion');
const GuildConfiguration = require('../../models/GuildConfiguration');

module.exports = {
    name: 'suggest',
    description: 'Submit a suggestion.',
    run: async (interaction) => {
        try {
            let guildConfiguration = await GuildConfiguration.findOne({ guildId: interaction.guildId });
            if (!guildConfiguration) {
                guildConfiguration = new GuildConfiguration({ guildId: interaction.guildId });
            }
            const modal = new ModalBuilder()
                .setCustomId('suggest-modal')
                .setTitle('Suggestion Box');

            const suggestionInput = new TextInputBuilder()
                .setCustomId('suggestion')
                .setLabel('What would you like to suggest?')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Type your suggestion here...')
                .setRequired(true);

            const firstActionRow = new ActionRowBuilder().addComponents(suggestionInput);
            modal.addComponents(firstActionRow);

            // Show the modal (no reply/defer before this!)
            await interaction.showModal(modal);

            // Wait for modal submission
            const modalInteraction = await interaction.awaitModalSubmit({
                time: 60000, // 1 minute
                filter: (i) =>
                    i.customId === 'suggest-modal' && i.user.id === interaction.user.id,
            });

            // Get suggestion value
            const suggestion = modalInteraction.fields.getTextInputValue('suggestion');

            // Build embed
            const embed = new EmbedBuilder()
                .setTitle('📬 New Suggestion!')
                .addFields(
                    { name: 'User', value: `<@${modalInteraction.user.id}>`, inline: true },
                    { name: 'Suggestion', value: suggestion }
                )
                .setColor('Blurple')
                .setTimestamp();

            // Replace this with your actual suggestion channel ID
            console.log(`${guildConfiguration.suggestionChannelIds}`);
            const channel = interaction.guild.channels.cache.get('1364759268242493510');

            if (!channel || channel.type !== ChannelType.GuildText) {
                return await modalInteraction.reply({
                    content: '❌ Suggestion channel not found.',
                    ephemeral: true,
                });
            }

            // Send suggestion to the channel
            await channel.send({ embeds: [embed] });

            // Confirm to the user
            await modalInteraction.reply({
                content: '✅ Your suggestion has been submitted!',
                ephemeral: true,
            });

        } catch (error) {
            console.error('❌ Error in suggest command:', error);

            // Handle timeout (no modal submitted)
            if (error.code === 'InteractionCollectorError') {
                console.log('Modal submission timed out.');
                return;
            }

            // Try to respond if possible
            if (typeof modalInteraction !== 'undefined' &&
                !modalInteraction.replied &&
                !modalInteraction.deferred) {
                await modalInteraction.reply({
                    content: '⚠️ Something went wrong while processing your suggestion.',
                    ephemeral: true,
                }).catch(err => {
                    console.error('❌ Failed to send error reply:', err);
                });
            }
        }
    },
};
