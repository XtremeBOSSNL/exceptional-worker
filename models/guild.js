const mongoose = require("mongoose");

const dataSchema = mongoose.Schema({
    name: String,
    owner: String,
    members: Array,
    power_req: {type: Number, default:0},
    farmLife_req: {type: Number, default:0},
});

module.exports = mongoose.model("guild", dataSchema);
