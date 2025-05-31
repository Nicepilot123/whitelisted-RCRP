const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
} = require('discord.js');
const ConfigureGuild = require('../../models/configServer');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Open the server config menu'),

  callback: async (client, interaction) => {
    /**
     * @param {import('discord.js').Interaction}
     */

    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: '❌ You need administrator permissions to use this command.', ephemeral: true });
    }
    let sectionIndex = 0;
    const sections = ['Staff & Management Roles', 'Session Ping Roles', 'Session Channel'];
    const guildConfig = await ConfigureGuild.findOne({ guildId: interaction.guildId }) || new ConfigureGuild({ guildId: interaction.guildId });

    const getEmbed = (index) => {
      let desc = "";
      let selected = "";

      if (index === 0) {
        desc = "Choose roles for staff and management.";
        selected = `**Staff Roles:** ${guildConfig.staffRole?.map(id => `<@&${id}>`).join(', ') || "None"}\n**Management Roles:** ${guildConfig.mgtRole?.map(id => `<@&${id}>`).join(', ') || "None"}`;
      } else if (index === 1) {
        desc = "Choose roles for session pings.";
        selected = guildConfig.sessionPing?.map(id => `<@&${id}>`).join(', ') || "None";
      } else {
        desc = "Choose a channel for session setup.";
        selected = guildConfig.sessionChannel ? `<#${guildConfig.sessionChannel}>` : "None";
      }

      return new EmbedBuilder()
        .setTitle(`Config: ${sections[index]}`)
        .setDescription(desc)
        .addFields({ name: 'Selected:', value: selected })
        .setColor('#0099ff');
    };

    const navButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('prev').setLabel('⬅️').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('next').setLabel('➡️').setStyle(ButtonStyle.Secondary)
    );

    const createSelectMenus = async (index) => {
      if (index === 0) {
        const roles = interaction.guild.roles.cache.map(r => ({
          label: r.name, value: r.id
        })).slice(0, 25);
        return [
          new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId('select_staff')
              .setPlaceholder('Select staff roles')
              .setMinValues(1).setMaxValues(roles.length)
              .addOptions(roles)
          ),
          new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId('select_mgt')
              .setPlaceholder('Select management roles')
              .setMinValues(1).setMaxValues(roles.length)
              .addOptions(roles)
          )
        ];
      } else if (index === 1) {
        const roles = interaction.guild.roles.cache.map(r => ({
          label: r.name, value: r.id
        })).slice(0, 25);
        return [
          new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId('select_ping')
              .setPlaceholder('Select session ping roles')
              .setMinValues(1).setMaxValues(roles.length)
              .addOptions(roles)
          )
        ];
      } else {
        const channels = interaction.guild.channels.cache
          .filter(ch => ch.isTextBased())
          .map(c => ({ label: c.name, value: c.id }))
          .slice(0, 25);
        return [
          new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId('select_channel')
              .setPlaceholder('Select session channel')
              .addOptions(channels)
          )
        ];
      }
    };

    let menuRows = await createSelectMenus(sectionIndex);
    const message = await interaction.reply({
      embeds: [getEmbed(sectionIndex)],
      components: [...menuRows, navButtons],
      fetchReply: true,
      flags: 64
    });

    const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });
    collector.on('collect', async i => {
      try {
        if (i.user.id !== interaction.user.id) return await i.reply({ content: "Not for you", ephemeral: true });
        if (i.customId === 'prev') sectionIndex = (sectionIndex - 1 + sections.length) % sections.length;
        if (i.customId === 'next') sectionIndex = (sectionIndex + 1) % sections.length;
        menuRows = await createSelectMenus(sectionIndex);
        await i.update({ embeds: [getEmbed(sectionIndex)], components: [...menuRows, navButtons] });
      } catch (err) { console.error(err); }
    });

    const selectCollector = message.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60000 });
    selectCollector.on('collect', async i => {
      try {
        if (i.user.id !== interaction.user.id) return await i.reply({ content: "Not for you", ephemeral: true });

        const toggleValues = (current, selected) => {
          const set = new Set(current);
          for (const val of selected) {
            if (set.has(val)) {
              set.delete(val);
            } else {
              set.add(val);
            }
          }
          return Array.from(set);
        };

        if (i.customId === 'select_staff') {
          guildConfig.staffRole = toggleValues(guildConfig.staffRole || [], i.values);
        } else if (i.customId === 'select_mgt') {
          guildConfig.mgtRole = toggleValues(guildConfig.mgtRole || [], i.values);
        } else if (i.customId === 'select_ping') {
          guildConfig.sessionPing = toggleValues(guildConfig.sessionPing || [], i.values);
        } else if (i.customId === 'select_channel') {
          guildConfig.sessionChannel = i.values[0];
        }

        await guildConfig.save();
        await i.update({ embeds: [getEmbed(sectionIndex)], components: [...menuRows, navButtons] });
      } catch (err) { console.error(err); }
    });
  }
};
