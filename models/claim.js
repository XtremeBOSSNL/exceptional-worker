const mongoose = require("mongoose");

const dataSchema = mongoose.Schema({
    user: String,
    claimReminder: Number,channel: String,
    active: Boolean,
});

module.exports = mongoose.model("claim", dataSchema);