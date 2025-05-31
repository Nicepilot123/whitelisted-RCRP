const { dir } = require('console');
const fs = require('fs');
const path = require('path');
const getAllFiles = require("../utils/getAllFiles");

module.exports = (client) => {
  const eventFolders = getAllFiles(path.join(__dirname, '..', 'event'), true);

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);
    const eventName = eventFolder.replace(/\\/g, '/').split('/').pop(); 

    client.on(eventName, async (arg) => {
      for (const eventFile of eventFiles) {
        try {
          const eventFunction = require(eventFile);
          // Ensure the eventFunction is actually a function before trying to call it
          if (typeof eventFunction === 'function') {
            await eventFunction(client, arg); 
          } else {
            console.error(`❌ The file ${eventFile} does not export a valid function.`);
          }
        } catch (err) {
          console.error(`❌ Failed to load event: ${err.message}`);
          console.log(err)
        }
      }
    });
  }
};
