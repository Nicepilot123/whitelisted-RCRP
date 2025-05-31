const { testServer } = require('../../../config.json');
const areCommandsDifferent = require('../../utils/commandDifferent');
const getApplicationCommands = require('../../utils/getApplicationCommand');
const getLocalCommands = require('../../utils/getLocalCommand');

module.exports = async (client) => {
  try {
    const localCommands = getLocalCommands(); // Get local commands
    const applicationCommands = await getApplicationCommands(client); // No guild ID = global // Fetch current commands from Discord API
    
    // Loop through all local commands
    for (const localCommand of localCommands) {
      const commandData = localCommand.data || localCommand;

      // Serialize command correctly using toJSON()
      const commandPayload = commandData.toJSON ? commandData.toJSON() : {
        name: commandData.name,
        description: commandData.description,
        options: commandData.options || [],
      };

      if (!commandPayload.name || !commandPayload.description) {
        console.log(`Skipping invalid command payload: ${JSON.stringify(commandPayload)}`);
        continue;
      }

      const { name, description, options } = commandPayload;

      // Check for an existing command in the application
      const existingCommand = await applicationCommands.cache.find(
        (cmd) => cmd.name === name
      );

      // If command exists, check if it needs updating
      if (existingCommand) {
        if (localCommand.deleted) {
          await applicationCommands.delete(existingCommand.id);
          console.log(`🗑 Deleted command "${name}".`);
          continue;
        }

        // Update the command if it's different
        if (areCommandsDifferent(existingCommand, commandPayload)) {
          await applicationCommands.edit(existingCommand.id, {
            description,
            options,
          });
          console.log(`🔁 Edited command "${name}".`);
        }
      } else {
        // Register new command
        if (localCommand.deleted) {
          console.log(`⏩ Skipping registering command "${name}" as it's set to delete.`);
          continue;
        }

        await applicationCommands.create({
          name,
          description,
          options,
        });
        console.log(`👍 Registered command "${name}".`);
      }
    }
  } catch (error) {
    console.error(`There was an error: ${error}`);
  }
};
