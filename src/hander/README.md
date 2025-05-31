# Event Handler 
This is the core to all file, all function will be export to here and run to different place.
This file come with **Typescript** and **Javascript**

⚠️ **WARNING**
- Follow instruction below to change eventFile and eventName if you having different file structure
- Always use cilent.on
- Command, Config and so on **MUST** import a proper function, else event handler will show warning

# How to change File Directory
Change the following code;
```js

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder); // Change This
    const eventName = eventFolder.replace(/\\/g, '/').split('/').pop(); // Change This if needed
```
Follow proper format by the way

# Credit
Event Handler Source Code: notunderctrl
