import {
    ChatInputCommandInteraction,
    Client,
    ApplicationCommandOptionType,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ButtonInteraction,
    TextChannel
} from 'discord.js';

interface Command {
    name: string;
    description: string;
    options: any[];
    permissionsRequired: bigint[];
    botPermissions: bigint[];
    callback: (client: Client, interaction: ChatInputCommandInteraction) => Promise<void>;
}

const command: Command = {
    name: 'session-vote',
    description: 'Vote for Session!',
    options: [{
        name: 'required-vote',
        description: 'Amount of player required to start session',
        type: ApplicationCommandOptionType.Number,
        required: true,
    }],
    permissionsRequired: [PermissionFlagsBits.Administrator],
    botPermissions: [PermissionFlagsBits.Administrator],

    callback: async (client: Client, interaction: ChatInputCommandInteraction) => {
        const allowedRoles = ['1360219041028898826'];
        const member = interaction.member as any;

        const hasRole = allowedRoles.every(roleId => member.roles.cache.has(roleId));

        if (!hasRole) {
            interaction.reply('Not Enough Permission. Missing <@&1360219041028898826> roles.');
            return;
        }

        let voters = new Set<string>();
        let voteCount = 0;
        const required_vote = interaction.options.getNumber('required-vote', true);
        const channel = interaction.channel as TextChannel;

        const SSUembed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL()})
            .setTitle('Whitelisted Seession')
            .setDescription('> - Session has been intinated! Everyone who has voted required to join within **20 minutes** or you will receive punishment.\n```                                                             ```\n**Server Information**\n- Server Name: `River City Roleplay | Test Holder`\n- Server Code: `mkiBJT` **(Case Sensitive)**\n- Server Owner: `pg22222221`')
            .setColor(0x0099FF)
            .setTimestamp();

        const initialEmbed = new EmbedBuilder()
            .setAuthor({ name: `Hosted By - ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTitle('Session Vote')
            .setDescription(`> - Session Vote has been initiated. If you're available, please click the button below. By voting, you're indicating your availability until the session is hosted.\n` +
                `**Vote Information:**\n- Required Vote: ${required_vote}\n- Hosted By: <@${interaction.user.id}>`)
            .setColor('Random')
            .setImage('https://media.discordapp.net/attachments/1194076153208635504/1271400942243414080/175942D9-6E06-4BE2-8625-487E2A62816C.jpg?ex=67fd7f26&is=67fc2da6&hm=c24839d212e567141ba42c92af7feb5206eb48b75a708a67b8f67b27b3858eb1&=&format=webp&width=1866&height=302')
            .setTimestamp();

        const voteButton = new ButtonBuilder()
            .setCustomId('vote')
            .setLabel(`Voters: ${voteCount}/${required_vote}`)
            .setStyle(ButtonStyle.Success);

        const button = new ButtonBuilder()
            .setLabel('Join Server')
            .setStyle(ButtonStyle.Link)
            .setURL('https://discordjs.guide/message-components/buttons.html#sending-buttons');

        const viewVoter = new ButtonBuilder()
            .setCustomId('viewvote')
            .setLabel(`View Voters`)
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(voteButton, viewVoter);
        const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

        const message = await channel.send({ content: '@everyone', embeds: [initialEmbed], components: [row] });

        const collector = message.createMessageComponentCollector();

        collector.on('collect', async (buttonInteraction: ButtonInteraction) => {
            if (!buttonInteraction.isButton()) return;

            const userId = buttonInteraction.user.id;

            if (buttonInteraction.customId === 'vote') {
                await buttonInteraction.deferUpdate();

                if (voters.has(userId)) {
                    voters.delete(userId);
                    voteCount--;
                    await buttonInteraction.followUp({ content: 'Removed your Vote Successfully!', ephemeral: true });
                } else {
                    voters.add(userId);
                    voteCount++;
                    await buttonInteraction.followUp({ content: 'Added your Vote!', ephemeral: true });
                }

                const updatedVoteButton = new ButtonBuilder()
                    .setCustomId('vote')
                    .setLabel(`Voters: ${voteCount}/${required_vote}`)
                    .setStyle(ButtonStyle.Success);

                const updatedRow = new ActionRowBuilder<ButtonBuilder>().addComponents(updatedVoteButton, viewVoter);
                await message.edit({ components: [updatedRow] });

                if (voteCount >= required_vote) {
                    const mentions = [...voters].map(voterId => `<@${voterId}>`);
                    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

                    await sleep(1000);
                    await channel.send({ content: `@everyone || ${mentions}`, embeds: [SSUembed], components: [row2] });
                    collector.stop();
                }
            } else if (buttonInteraction.customId === 'viewvote') {
                if (voters.size > 0) {
                    const voterList = [...voters].map(voterId => `<@${voterId}>`).join(', ');
                    const VoterEmbed = new EmbedBuilder()
                        .setTitle('All Voters')
                        .setDescription(`\n- ${voterList}`)
                        .setColor('Random')
                        .setTimestamp();

                    await buttonInteraction.reply({ embeds: [VoterEmbed], ephemeral: true });
                } else {
                    const NoVoterEmbed = new EmbedBuilder()
                        .setTitle('All Voters')
                        .setDescription('\n- No votes yet!')
                        .setColor(0x0099FF)
                        .setTimestamp();

                    await buttonInteraction.reply({ embeds: [NoVoterEmbed], ephemeral: true });
                }
            }
        });

        collector.on('end', async (_, reason) => {
            if (reason === 'time') {
                await channel.send('Session vote ended due to inactivity.');
            }

            const disabledVoteButton = new ButtonBuilder()
                .setCustomId('vote')
                .setLabel(`Voters: ${voteCount}/${required_vote}`)
                .setStyle(ButtonStyle.Success)
                .setDisabled(true);

            const disabledViewVoter = new ButtonBuilder()
                .setCustomId('viewvote')
                .setLabel(`View Voters`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true);

            const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(disabledVoteButton, disabledViewVoter);
            await message.edit({ components: [disabledRow] });
        });
    },
};

export default command;
