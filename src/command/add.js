const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Add a user to this ticket.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to add to the ticket')
        .setRequired(true)
    ),

  run: async (interaction) => {
    // Check if the interaction is a Slash Command
    if (!interaction.isCommand()) return;

    const userToAdd = interaction.options.getUser('user');
    const channel = interaction.channel;

    // Make sure we're in a ticket channel
    const validPrefixes = ['gen-', 'report-', 'prty-'];
    const isTicket = validPrefixes.some(prefix => channel.name.startsWith(prefix));

    if (!isTicket) {
      return interaction.reply({
        content: '❌ This command can only be used inside a ticket channel.',
        ephemeral: true,
      });
    }

    try {
      // Add user to the ticket channel permissions
      await channel.permissionOverwrites.edit(userToAdd.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
      });

      await interaction.reply({
        content: `✅ Successfully added ${userToAdd} to the ticket.`,
      });

    } catch (error) {
      console.error('❌ Error adding user to ticket:', error);
      await interaction.reply({
        content: '❌ Failed to add the user. Please check my permissions.',
        ephemeral: true,
      });
    }
  }
};
