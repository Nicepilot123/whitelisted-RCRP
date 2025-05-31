# Models - MongoDB Database
Models or modal or whatever. Use to make new database? idk what you call it
Typescript is not required for this obviously

 ⚠️ **WARNING**
 - Make sure to `const mongoose = require('mongoose');`
 - Make it readable

# How to use
Start code with this: (File name still.js)
```js
const mongoose = require('mongoose');

const schemaName = new mongoose.Schema({
  newName: {
    type: String, // There is more than String, and you can add () or [] ex - [String]
    required: true, // Required?
    default: null // Default can be anything, used when in database, this dosent exist
  },
})

module.exports = mongoose.model('SchemaName', schemaname);
```
