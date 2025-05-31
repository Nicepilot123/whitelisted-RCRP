const { ActionRowBuilder, StringSelectMenuBuilder, ComponentType, ButtonBuilder, ButtonStyle, EmbedBuilder, } = require('discord.js');
const Application = require('../../models/application');

module.exports = async (client, interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId === 'app-start') {
            await interaction.reply({ content: '🚀 Starting your application! Check your DMs.', ephemeral: true });
            const user = interaction.user;
            const dm = await user.createDM();

            const questions = [
                { key: 'robloxUsername', question: "What's your Roblox username?", type: 'text' },
                { key: 'age', question: 'Select your age:', type: 'select', options: [{ label: '12', value: '12' }, { label: '13', value: '13' }, { label: '14', value: '14' }, { label: '15', value: '15' }, { label: '16', value: '16' }, { label: '17', value: '17' }, { label: '18', value: '18' }, { label: '19', value: '19' }, { label: '20+', value: '21' }], failIf: (ans) => parseInt(ans) < 13, failMessage: '❌ Sorry, you must be at least 13 to apply. Application failed.' },
                { key: 'isEmployedInDept', question: 'Are you employed in the department?', type: 'select', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] },
                { key: 'employedDepartment', question: 'Which department are you employed in?', type: 'text', skipIf: (a) => a['isEmployedInDept'] === 'no', default: 'None' },
                { key: 'reasonToJoin', question: 'Why do you want to join?', type: 'text' },
                { key: 'improveRoleplay', question: 'How would you improve roleplay?', type: 'text' },
                { key: 'roleplayScenario', question: 'Describe a roleplay scenario you would like to do.', type: 'text' },
                { key: 'canSetupCivilian', question: 'Can you set up a civilian properly?', type: 'select', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }], failIf: (ans) => ans === 'no', failMessage: '❌ Sorry, you must be able to set up a civilian. Application failed.' },
            ];


            try {
                for (const q of questions) {
                    if (q.skipIf && q.skipIf(answers)) {
                        answers[q.key] = q.default;
                        continue;
                    }

                    const embed = { title: 'Application Question', description: `${q.question}\n\n(Type 'cancel' anytime to stop the application)`, color: 0x0099ff };

                    let response;

                    if (q.type === 'select') {
                        const select = new StringSelectMenuBuilder().setCustomId('select_' + q.key).setPlaceholder('Select an option').addOptions(q.options);
                        const row = new ActionRowBuilder().addComponents(select);
                        const msg = await dm.send({ embeds: [embed], components: [row] });
                        const filter = (i) => i.user.id === user.id && i.customId === 'select_' + q.key;
                        const collected = await msg.awaitMessageComponent({ filter, componentType: ComponentType.StringSelect, time: 1800000 });
                        response = collected.values[0];
                        await collected.update({ components: [] });
                        if (response.toLowerCase().includes('cancel')) return dm.send('❌ Application canceled by user.');
                    } else {
                        await dm.send({ embeds: [embed] });
                        const filter = (m) => m.author.id === user.id;
                        const collected = await dm.awaitMessages({ filter, max: 1, time: 1800000, errors: ['time'] });
                        response = collected.first().content.trim();
                        if (response.toLowerCase().includes('cancel')) return dm.send('❌ Application canceled by user.');
                    }

                    if (q.failIf && q.failIf(response)) return dm.send(q.failMessage);
                    answers[q.key] = response;

                    // Detect AI content for the response
                    const aiScore = await detectAIContent(response);
                    if (aiScore !== null) aiScores.push(aiScore);
                }

                // Calculate average AI detection score
                const averageAIScore = aiScores.length > 0 ? (aiScores.reduce((a, b) => a + b, 0) / aiScores.length).toFixed(2) : 'N/A';
                console.log('Average AI Detection Score:', averageAIScore);

                answers.age = parseInt(answers.age);
                answers.isEmployedInDept = answers.isEmployedInDept === 'yes';
                answers.canSetupCivilian = answers.canSetupCivilian === 'yes';

                const newApp = new Application({
                    robloxUsername: answers.robloxUsername,
                    age: answers.age,
                    isEmployedInDept: answers.isEmployedInDept,
                    employedDepartment: answers.employedDepartment,
                    reasonToJoin: answers.reasonToJoin,
                    improveRoleplay: answers.improveRoleplay,
                    roleplayScenario: answers.roleplayScenario,
                    canSetupCivilian: answers.canSetupCivilian,
                    appStatus: 'Pending',
                    submittedAt: new Date(),
                    discordUserId: interaction.user.id,
                });

                await newApp.save();
                await dm.send('✅ Thanks for completing the application! Your responses were saved.');

                const robloxUser = answers.robloxUsername;

                async function getUserInfo(username) {
                    try {
                        const profileResponse = await fetch(`https://www.roblox.com/users/profile?username=${username}`);
                        if (!profileResponse.ok) throw new Error("Failed to get profile");
                        const userId = profileResponse.url.match(/\d+/)[0];

                        const userInfoResponse = await fetch(`https://users.roblox.com/v1/users/${userId}`);
                        if (!userInfoResponse.ok) throw new Error("Failed to get user info");

                        const userInfo = await userInfoResponse.json();

                        return { userId, userInfo };
                    } catch (error) {
                        console.error("Error:", error);
                        return null;
                    }
                }

                const globalUserData = await getUserInfo(robloxUser);

                if (!globalUserData) {
                    await dm.send('❌ Failed to get Roblox user data. Please use proper username.');
                    return; // stop execution if data missing
                }

                const displayAge = answers.age === 21 ? '20+' : answers.age.toString();
                const reviewEmbed = new EmbedBuilder().setTitle('📨 New Application Received').setColor(0x00bfff).setTimestamp().addFields(
                    { name: 'Roblox Username', value: answers.robloxUsername },
                    { name: 'Age', value: displayAge, inline: true },
                    { name: 'Employed in Dept?', value: answers.isEmployedInDept ? 'Yes' : 'No', inline: true },
                    { name: 'Department', value: answers.employedDepartment || 'None' },
                    { name: 'Reason to Join', value: answers.reasonToJoin },
                    { name: 'Improve Roleplay', value: answers.improveRoleplay }, 
                    { name: 'Roleplay Scenario', value: answers.roleplayScenario },
                    { name: 'Can Setup Civilian', value: answers.canSetupCivilian ? 'Yes' : 'No', inline: true },
                    { name: 'Submitted At', value: newApp.submittedAt.toLocaleString(), inline: true });

                const created = '2023-02-01T22:38:52.643Z';

                const createdDate = new Date(created);
                const today = new Date();

                const monthNames = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];

                const day = String(createdDate.getDate()).padStart(2, '0');
                const month = monthNames[createdDate.getMonth()];
                const year = createdDate.getFullYear();

                const formattedDate = `${day} ${month} of ${year}`;

                // Calculate days since creation
                const diffMs = today - createdDate;
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));


                const robloxInfoEmbed = new EmbedBuilder()
                    .setTitle("Applicant's Roblox Information")
                    .setDescription(`**ROBLOX Username:** [${globalUserData.userInfo.name}](https://www.roblox.com/users/${globalUserData.userInfo.id}/profile)\n
                          **Description:** ${globalUserData.userInfo.description}\n
                          **Creation Date:** ${formattedDate}, **${diffDays} Days Ago**\n
                          **Profile ID:** ${globalUserData.userInfo.id}\n`)

                const actionRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`app_accept_${newApp._id}`).setLabel('✅ Accept').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId(`app_deny_${newApp._id}`).setLabel('❌ Deny').setStyle(ButtonStyle.Danger)
                );

                const reviewChannel = await client.channels.fetch('1307100256894324916');
                if (reviewChannel) {
                    await reviewChannel.send({ embeds: [reviewEmbed, robloxInfoEmbed], components: [actionRow] });
                }
                return newApp;

            } catch (error) {
                console.error('❌ Application error:', error);
                return dm.send('⏰ Error Occurred.');
            }
        }

        interaction.showModal(modal);
    }
};