const mongoose = require("mongoose");

const dataSchema = mongoose.Schema({
    user: String,
    useless: {type: Number, default: 0},
    deficient: {type: Number, default: 0},
    common: {type: Number, default: 0},
    talented: {type: Number, default: 0},
    wise: {type: Number, default: 0},
    expert: {type: Number, default: 0},
    masterful: {type: Number, default: 0},
});

module.exports = mongoose.model("worker", dataSchema);