const User = require('../models/user');
const Discord = require('discord.js');
const Workers = require('../models/worker');

const worker_data = require('../data/workers.json').workers;

module.exports.run = async (bot, us, msg) => {
    let embed = msg.embeds[0];

    let farmLife = 0;
    for(let i = 0; i < embed.fields.length;i++) {
        if (embed.fields[i].value.includes('farm life')) {
            farmLife = /\*\*Level\*\*:\s(\d+)\s\|/g.exec(embed.fields[i].value)[1] || 0;
        }
    }
    us.data.farmLife = farmLife;
    us.save().catch(err=>console.log(err));
}

module.exports.help = {
  name: "upgrades",
  aliases: []
}