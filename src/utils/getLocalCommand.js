const path = require('path');
const getAllFiles = require('./getAllFiles');

module.exports = (exception = []) => {
  const localCommands = [];
  const commandCategories = getAllFiles(path.join(__dirname, '..', 'command'), true); // folder level

  for (const category of commandCategories) {
    const commandFiles = getAllFiles(category); // get all .js files recursively

    for (const file of commandFiles) {
      const CommandObject = require(file);

      const hasBuilderData = CommandObject.data && CommandObject.data.name;
      const hasPlainData = CommandObject.name && CommandObject.description;

      if (hasBuilderData || hasPlainData) {
        localCommands.push({
          name: CommandObject.data?.name || CommandObject.name,
          ...CommandObject,
        });
      } else {
        console.warn(`⚠️ Skipping invalid command in file: ${file}`);
      }
    }
  }

  return localCommands;
};
  