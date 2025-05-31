# (WL) River City Roleplay - Bot
Open Source **FOR DEVELOPER ONLY**. This is coded in **Javascript** and **Typescript** (discord.js). 
The database used in source are **MongoDB**, using node.js package **Mongoose**.

⚠️ **WARNING:**
- Put all token, MongoDB URI, and ER:LC API in **.env** file for your security.
- Avoid overloading database
- Use typescript as much as possible

📋 **NOTE:**
- Your file should've more file than this, such as node_module, .vscode and more. It won't be put in our file today
- .envExample file should be name **EXACTLY** `.env`

📥 **PACKAGE USED:**
1. [discord.js (Required)](https://discord.js.org/)
2. [nodemon](https://www.npmjs.com/package/nodemon)
3. [eslint/js](https://www.npmjs.com/package/@eslint/js)
4. [dotenv (Required)](https://www.npmjs.com/package/dotenv)
5. [Mongoose](https://www.npmjs.com/package/mongoose) - [MongoDB Database](https://www.mongodb.com)
   
# How to Use
1. Install [Node.js](https://nodejs.org/en/download)
2. Install npm
  ```node
  npm init -y
  ```
2. Install package
  ```node
  npm install discord.js dotenv mongoose nodemon
  ```
3. Install **Typescript** stuff (optional if you have no plan writing Typescript, but recommended)
  ```node
  npm install typescript ts-node @types/node --save-dev
  npx tsc --init
  ```
4. Run Command in Terminal:
  ```bash
  nodemon src/index.js
  ```
You can change your source file anywhere, but it must direct to **index.js** file everytime. `nodemon (file directory)`

# Credit
Thanks you:
1. Source File for ultils, eventHandler and essential file - notunderctrl
2. Error Fixer - ChatGPT, Grok, DeepSeek, Claud
3. RCRP Developer - Bugkung1412
