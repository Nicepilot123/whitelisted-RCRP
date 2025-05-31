const { devs } = require('../../../config.json');
const getLocalCommand = require('../../utils/getLocalCommand');

module.exports = async (client, interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const LocalCommand = getLocalCommand();

    try {
        const commandObject = LocalCommand.find((cmd) => cmd.name === interaction.commandName);
        if (!commandObject) return;

        // Developer-only check
        if (commandObject.devOnly) {
            if (!devs.includes(interaction.user.id)) {
                await interaction.reply({
                    content: 'Only developers are allowed to run this command.',
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }
        }

        // Member permission check
        if (commandObject.permissionRequired?.length) {
            for (const perm of commandObject.permissionRequired) {
                if (!interaction.member.permissions.has(perm)) {
                    await interaction.reply({
                        content: 'You do not have the required permissions.',
                        flags: MessageFlags.Ephemeral,
                    });
                    return;
                }
            }
        }

        // Bot permission check
        if (commandObject.botPermission?.length) {
            const bot = interaction.guild.members.me;
            for (const perm of commandObject.botPermission) {
                if (!bot.permissions.has(perm)) {
                    await interaction.reply({
                        content: 'I do not have the required permissions to run this command.',
                        flags: MessageFlags.Ephemeral,
                    });
                    return;
                }
            }
        }

        // Support both `callback` and `run`
        if (typeof commandObject.callback === 'function') {
            await commandObject.callback(client, interaction);
        } else if (typeof commandObject.run === 'function') {
            await commandObject.run(interaction);
        } else {
            console.warn(`No executable function (callback/run) found for command "${interaction.commandName}".`);
        }

    } catch (error) {
        console.error(error);
        if (!interaction.replied && !interaction.deferred) {
            interaction.reply({ content: 'There was an error executing this command.', flags: MessageFlags.Ephemeral });
        }
    }
};
