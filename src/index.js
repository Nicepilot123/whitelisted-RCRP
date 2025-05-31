require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');
const mongoose = require('mongoose');
const eventHandler = require('./handler/eventHandler');
const client = new Client({
    intents: new IntentsBitField([
        'Guilds',
        'GuildMembers', // Required for fetching guilds
        'GuildMessages', // Required for fetching channels
        'GuildMessageReactions',
        'MessageContent',
        'GuildBans',
        'GuildEmojisAndStickers',
        'GuildIntegrations',
        'GuildWebhooks',
        'GuildInvites',
        'GuildVoiceStates',
        'GuildPresences',
        'DirectMessages',
        'DirectMessageReactions',
        'DirectMessageTyping'
    ])
});


mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log("📅 Connected to MongoDB");
    eventHandler(client);
    
    client.login(process.env.TOKEN);
})

