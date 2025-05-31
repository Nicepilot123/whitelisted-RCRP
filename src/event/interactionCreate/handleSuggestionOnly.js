const { PermissionFlagsBits, Colors } = require('discord.js');
const Suggestion = require('../../models/Suggestion');

/**
 * @param {import('discord.js').Interaction} interaction
 */
module.exports = async (client, interaction) => {
    if (!interaction.isButton()) return;
    if (!interaction.customId) return;

    const [type, suggestionId, action] = interaction.customId.split('.');
    if (type !== 'suggestion' || !suggestionId || !action) return;

    try {
        console.log(`📩 Button interaction: ${interaction.customId}`);

        // Defer the interaction to allow a reply later
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply({ ephemeral: true });
        }

        const suggestion = await Suggestion.findOne({ suggestionId });
        if (!suggestion) {
            console.log(`❌ Suggestion not found: ${suggestionId}`);
            return await interaction.editReply({ content: '❌ Suggestion not found.' });
        }

        const message = await interaction.channel.messages.fetch(suggestion.messageId).catch(() => null);
        if (!message) {
            console.log(`❌ Message not found: ${suggestion.messageId}`);
            return await interaction.editReply({ content: '❌ Original suggestion message not found.' });
        }

        const embed = message.embeds[0];
        if (!embed || !embed.fields || embed.fields.length < 2) {
            console.log('❌ Embed is missing or malformed.');
            return await interaction.editReply({ content: '❌ Invalid suggestion embed.' });
        }

        const updatedEmbed = embed.toJSON();

        if (action === 'approve') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return await interaction.editReply({ content: '❌ You need Administrator permissions to approve suggestions.' });
            }

            suggestion.status = 'Approved';
            updatedEmbed.color = Colors.Green;
            updatedEmbed.fields[1].value = '✅ - Approved';
        } else if (action === 'reject') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return await interaction.editReply({ content: '❌ You need Administrator permissions to reject suggestions.' });
            }

            suggestion.status = 'Rejected';
            updatedEmbed.color = Colors.Red;
            updatedEmbed.fields[1].value = '❌ - Rejected';
        } else {
            return await interaction.editReply({ content: '❌ Invalid action.' });
        }

        await suggestion.save();

        await message.edit({
            embeds: [updatedEmbed],
            components: [message.components[0]],
        });

        await interaction.editReply({ content: `✅ Suggestion ${action}ed successfully.` });

    } catch (error) {
        console.error(`❌ Error handling suggestion:`, error);

        if (!interaction.deferred && !interaction.replied) {
            await interaction.reply({
                content: '❌ An error occurred while processing the suggestion.',
                ephemeral: true,
            }).catch(err => {
                console.error(`❌ Failed to send error reply:`, err);
            });
        } else {
            await interaction.editReply({
                content: '❌ An error occurred while processing the suggestion.',
            }).catch(err => {
                console.error(`❌ Failed to edit error reply:`, err);
            });
        }
    }
};
