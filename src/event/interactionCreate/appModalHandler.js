const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    ChannelType,
    EmbedBuilder,
  } = require('discord.js');
const applicationDB = require('../../models/application');
const GuildConfiguration = require('../../models/GuildConfiguration');
  
  module.exports = async (client, interaction) => {
    

    // console.log(robloxInfoData)
    // console.log(dataId)


    // ✅ BUTTON HANDLER
    if (interaction.isButton()) {
      const customId = interaction.customId;
  
      if (customId.startsWith('app_accept_') || customId.startsWith('app_deny_')) {
        const [_, action, appId] = customId.split('_');
  
        const modal = new ModalBuilder()
          .setCustomId(`app_${action}_${appId}`)
          .setTitle(`${action === 'accept' ? '✅ Accept' : '❌ Deny'} Application`);
  
        const feedbackInput = new TextInputBuilder()
          .setCustomId('feedback')
          .setLabel('Feedback or Reason')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
          .setPlaceholder('Write your reason here...');
  
        const row = new ActionRowBuilder().addComponents(feedbackInput);
        modal.addComponents(row);
  
        return await interaction.showModal(modal);
      }
    }
  
    // ✅ MODAL HANDLER
    if (interaction.isModalSubmit()) {
      const customId = interaction.customId;
  
      if (customId.startsWith('app_accept_') || customId.startsWith('app_deny_')) {
        const [_, action, appId] = customId.split('_');
        const feedback = interaction.fields.getTextInputValue('feedback');
  
        // 🔔 Log to channel
        const logChannelId = '1307100092280344739';
        const logChannel = await interaction.guild.channels.fetch(logChannelId);
  
        if (!logChannel || logChannel.type !== ChannelType.GuildText) {
          return interaction.reply({ content: '❌ Log channel not found.', ephemeral: true });
        }

        const acceptedMsg = `> Congratulation on being accepted and welcome to Whitelisted River City Roleplay! We're glad you've made it this far!
                        > Once accepted, you're required to complete a **Whitelisted Civilian Character Setup** in order to roleplay here! Please check links
                        > below for further information!\n\n**Application Feedback:**\n> ${feedback} `
        const deniedMsg = `Unfortunately, your entrance application have been **denied**. You can re-apply the application anytime you wished.
                        Hope you see you soon!\n**Application Feedback:**\n> ${feedback}`

        const embed = new EmbedBuilder()
        .setAuthor({ name: `Accepted By: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
        .setTitle(`📥 Application ${action === 'accept' ? 'Accepted' : 'Denied'}`)
        .setDescription(`${action === 'accept' ? acceptedMsg : deniedMsg}`)
        .setFields(action === 'accept' ? [{ name: '🔗 Important Links', value: 'Skip', inline: true }, { name: '🔗 Important Channel', value: 'Skip', inline: true }] : [])

            let databaseApplication = await applicationDB.findOne({ _id: appId });
            if (!databaseApplication) {
                return interaction.reply('Error Code 205');
            }

        await logChannel.send({
          content: `<@${databaseApplication.discordUserId}>`, embeds: [embed]
        });
  
        return interaction.reply({
          content: `✅ You have successfully **${action}ed** the application!`,
          ephemeral: true,
        });
      }
    }
  };
