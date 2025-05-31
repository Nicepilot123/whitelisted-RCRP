import { Client } from 'discord.js';
import path from 'path';
import getAllFiles from '../utils/getAllFiles';
import fs from 'fs';

// We recommended to change getAllFile to typescript as well

export default (client: Client): void => {
  const eventFolders = getAllFiles(path.join(__dirname, '..', 'event'), true);

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);
    const eventName = eventFolder.replace(/\\/g, '/').split('/').pop();

    if (!eventName) continue; // safeguard

    client.on(eventName, async (arg: any) => {
      for (const eventFile of eventFiles) {
        try {
          const eventFunction = require(eventFile);

          if (typeof eventFunction === 'function') {
            await eventFunction(client, arg);
          } else if (typeof eventFunction.default === 'function') {
            await eventFunction.default(client, arg); // for ES6 default exports
          } else {
            console.error(`❌ The file ${eventFile} does not export a valid function.`);
          }
        } catch (err: any) {
          console.error(`❌ Failed to load event: ${err.message}`);
          console.log(err);
        }
      }
    });
  }
};
