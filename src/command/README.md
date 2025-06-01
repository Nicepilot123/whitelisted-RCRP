# Slash Command
All file here are slash command registered. All are registered via regcommand.js, eventHandler.js and more.
This support **Javascript** and **Typescript**. Feel free to use any of them

⚠️ **WARNING**
- Always export function proper or you will receive error
- There is different way to register slash command via **Javascript** and **Typescript**

📋 **NOTE:**
- PermissionFlagBits is not recommended nor best way to do it. Do check roles and stuff normally.
```js
if (member.roles.cache.has("ROLE_ID")) {
// MAKE SURE TO RETURN IT!!
  return interaction.reply("❌ Not Enough Permission")
}
```

# How to Use
Start code with this;
1. Normal Way (Idk what its called):
```js
const { PermissionFlagBits } = require('discord.js');
  
  module.exports = {
    name: 'command-name', // Use dash if your command having space
    description: '', // This will be overide anyways if you have SubCommand
    permissionsRequired: [PermissionFlagsBits.Administrator], // Required Perm for members to use
  }

    callback: (cilent, interaction) => {
      // code here
    }
```

2. Number 1 way but TypeScript

 ```ts
import { PermissionFlagBits } from 'discord.js';

interface Command {
    name: string;
    description: string;
    options: any[]; // Not required if you don't have command option
    permissionsRequired: bigint[];
    botPermissions: bigint[];
    callback: (client: Client, interaction: ChatInputCommandInteraction) => Promise<void>;
}

const command: Command = {
    name: '',
    description: '',
    permissionsRequired: [PermissionFlagsBits.Administrator],

    callback: async (client: Client, interaction: ChatInputCommandInteraction) =>{
    // code here
}
```

3. Option System
```js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('command-dash') // Don't forgot dash
    .setDescription('') // Same with number 1
// There is String, Integer, Number, Boolean, User, Channel, Role, Mentionable (user or role)
// You can change the option - .addXYZOption
Attachment (file upload)
    .addUserOption(option =>
      option.setName('') // Name
        .setDescription('') // Option Description
        .setRequired(true) // Required? 
    ),
```

4. Option System but TypeScript
```ts
import { SlashCommandBuilder } from '@discordjs/builders';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('command-dash') // Don't forgot dash
    .setDescription('') // Same with number 1
// There is String, Integer, Number, Boolean, User, Channel, Role, Mentionable (user or role)
// You can change the option - .addXYZOption
    .addUserOption(option =>
      option.setName('') // Name
        .setDescription('') // Option Description
        .setRequired(true) // Required? 
    ),
```

5. Subcommand
```js
const { SlashCommandBuilder } = require('discord.js');

    data: new SlashCommandBuilder()
        .setName('')
        .setDescription('') // This will be overide with subcommand description anyways.
        .addSubcommand((subcommand) =>
            subcommand
                .setName('')
                .setDescription('')
// Example case how to use option inside subcommand
                .addChannelOption((option) =>
                    option
                        .setName('channel')
                        .setDescription('Select a text channel to add')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
        )
```
