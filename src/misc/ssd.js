const { ChatInputCommandInteraction } = require('discord.js');
const {
    ApplicationCommandOptionType,
    PermissionFlagsBits, EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
  } = require('discord.js');
  
  module.exports = {
    name: 'ssd',
    description: 'Shut down Session',
    // devOnly: Boolean,
    // testOnly: Boolean,
    permissionsRequired: [PermissionFlagsBits.Administrator],
    botPermissions: [PermissionFlagsBits.Administrator],
  
    callback: (client, interaction) => {

      const allowedRoles = ['1360219041028898826']

      const hasRole = allowedRoles.every(roleId => interaction.member.roles.cache.has(roleId));

      if (!hasRole){
          interaction.reply('Not Enough Permission. Missing <@&1360219041028898826> roles.')
          return;
      }
        /**
         * @param {Object} param0
         * @param {ChatInputCommandInteraction} param0.interaction
         */

      const channel = interaction.channel;

      const SSDembed = new EmbedBuilder()
      .setAuthor({name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({dynamic: true})})
      .setTitle('Server Shut Down')
      .setDescription(`> - Session has been shut down. You're not permitted to join the game under any circumstances.`)
      .setColor(0x0099FF)
      .setTimestamp();

      const button = new ButtonBuilder()
      .setLabel('Rules')
      .setStyle(ButtonStyle.Link)
      .setURL('https://discordjs.guide/message-components/buttons.html#sending-buttons')      

      const row = new ActionRowBuilder().addComponents(button)

      if (!interaction.memberPermissions.has('Administrator')){
        interaction.reply('No permission to run this command')
      }

      channel.send({content: '@here', embeds: [SSDembed], components: [row] })
    },
  };