const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true,
    },
    staffRole: {
        type: [String],
        default: []
    },
    mgtRole: {
        type: [String],
        default: []
    },
    sessionChannel: {
        type: String,
        default: null
    },
    sessionPing: {
        type: [String],
        default: []
    }
})

module.exports = mongoose.model('ConfigureGuild', configSchema)