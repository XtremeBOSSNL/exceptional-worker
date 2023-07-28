const mongoose = require("mongoose");

const dataSchema = mongoose.Schema({
    user: String,
    energyFull: Number,
    channel: String,
    active: Boolean,
});

module.exports = mongoose.model("energy", dataSchema);