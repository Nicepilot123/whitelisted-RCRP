const { Schema, model } = require('mongoose');

const SuggestionSchema = new Schema({
    suggestionId: {
        type: String,
    },
    authorId: {
        type: String,
        required: true,
    },
    guildId: {
        type: String,
        required: true
    },
    messageId: {
        type: String,
        required: true,
        unqiue: true,
    },
    content: {
        type: String,
        required: true,
    },
    status: {
        // Pending, Approved, Denied
        type: String,
        default: "Pending",
    },
    upvote: {
        type: [String],
        default: [],
    },
    downvote: {
        type: [String],
        default: [],
    },
}, { timestamps: true });

module.exports = model('Suggestion', SuggestionSchema);