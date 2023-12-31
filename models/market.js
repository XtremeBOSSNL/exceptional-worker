const mongoose = require("mongoose");

const dataSchema = mongoose.Schema({
  day: Number,
  month: Number,
  year: Number,
  material: {
    wood: {type: Number, default:0},
    stick: {type: Number, default:0},
    apple: {type: Number, default:0},
    leaf: {type: Number, default:0},
    water: {type: Number, default:0},
    rock: {type: Number, default:0},
    sand: {type: Number, default:0},
    algae: {type: Number, default:0},
    potato: {type: Number, default:0},
    dirt: {type: Number, default:0},
    root: {type: Number, default:0},
    wheat: {type: Number, default:0},
    seed: {type: Number, default:0},
    bug: {type: Number, default:0},
    broken_bottle: {type: Number, default:0},
    gold_nugget: {type: Number, default:0},
    cotton: {type: Number, default:0},
    coal: {type: Number, default:0},
    iron_ore: {type: Number, default:0},
    copper_ore: {type: Number, default:0},
    dust: {type: Number, default:0},
    aluminium_ore: {type: Number, default:0},
    milk: {type: Number, default:0},
    meat: {type: Number, default:0},
    leather: {type: Number, default:0},
    horn: {type: Number, default:0},
    sawdust: {type: Number, default:0},
  },
  embed: {type: Object, default:{}},
  donorEmbed: {type: Object, default:{}},
});

module.exports = mongoose.model("market", dataSchema);
