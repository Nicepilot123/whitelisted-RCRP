import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  GuildMember,
  Client
} from 'discord.js';
import configServer from '../../models/configServer';

export default {
  data: new SlashCommandBuilder()
    .setName('ssu')
    .setDescription('Startup Server!')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  /**
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client: Client, interaction: ChatInputCommandInteraction) => {
    const allowedRoles = ['1360219041028898826'];
    const member = interaction.member as GuildMember;

    const hasRole = allowedRoles.every(roleId =>
      member.roles.cache.has(roleId)
    );

    if (!hasRole) {
      return interaction.reply({
        content: '❌ Not enough permissions. You need <@&1360219041028898826> role.',
        ephemeral: true
      });
    }

    const guildConfig = await configServer.findOne({ guildId: interaction.guildId });

    if (!guildConfig) {
      return interaction.reply({
        content: '⚠️ No server configuration found.',
        ephemeral: true
      });
    }

    const sessionChannel = await interaction.guild?.channels.fetch(guildConfig.sessionChannel);

    if (!sessionChannel || !sessionChannel.isTextBased()) {
      return interaction.reply({
        content: '❗ The configured session channel is not valid or not found.',
        ephemeral: true
      });
    }

    const button = new ButtonBuilder()
      .setLabel('Join Server')
      .setStyle(ButtonStyle.Link)
      .setURL('https://discordjs.guide/message-components/buttons.html#sending-buttons');

    const SSUembed = new EmbedBuilder()
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setTitle('Whitelisted Session')
      .setDescription(
        '> - Session has been initiated! Everyone who has voted is required to join within **20 minutes** or you will receive punishment.\n' +
        '```                                                             ```\n' +
        '**Server Information**\n' +
        '- Server Name: `River City Roleplay | Test Holder`\n' +
        '- Server Code: `mkiBJT` **(Case Sensitive)**\n' +
        '- Server Owner: `pg22222221`'
      )
      .setColor(0x0099FF)
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    await sessionChannel.send({
      content: '@everyone',
      embeds: [SSUembed],
      components: [row]
    });

    await interaction.reply({
      content: '✅ SSU has been sent successfully!',
      ephemeral: true
    });
  }
};