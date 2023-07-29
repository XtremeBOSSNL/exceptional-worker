const mongoose = require("mongoose");

const dataSchema = mongoose.Schema({
    enemyString: String,
    attackerString: String,
    farmlife: {type: Number, default: 100},
    best_score: {type: Number, default:0},
    best_solution: {type: Array, default:[]},
    stats: {type: Object, default: {}},
});

module.exports = mongoose.model("raidSolution", dataSchema);