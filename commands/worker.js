const User = require('../models/user');
const Discord = require('discord.js');
const Workers = require('../models/worker');
const worker_data = require('../data/workers.json').workers;

const type_to_name = ['None','useless','deficient','common','talented','wise','expert','masterful'];

module.exports.run = async (bot, msg, args) => {
  let userid = msg.author.id;

  let us = await User.findOne({ user: userid }).exec();
  if (!us) return msg.reply({content:"You've not registed with this bot \`ew start\`"});

  let worker = await Workers.findOne({ user:us.user }).exec();
  if (!worker) return msg.reply({content:`No worker data, do \`idle wo\``});

  let workers = [];
  if (worker.useless) {
    workers.push({
      power:get_power(1, worker.useless),
      level: worker.useless,
      type:1,
    })
  }
  if (worker.deficient) {
    workers.push({
      power:get_power(2, worker.deficient),
      level: worker.deficient,
      type:2,
    })
  }
  if (worker.common) {
    workers.push({
      power:get_power(3, worker.common),
      level: worker.common,
      type:3,
    })
  }
  if (worker.talented) {
    workers.push({
      power:get_power(4, worker.talented),
      level: worker.talented,
      type:4,
    })
  }
  if (worker.wise) {
    workers.push({
      power:get_power(5, worker.wise),
      level: worker.wise,
      type:5,
    })
  }
  if (worker.expert) {
    workers.push({
      power:get_power(6, worker.expert),
      level: worker.expert,
      type:6,
    })
  }
  if (worker.masterful) {
    workers.push({
      power:get_power(7, worker.masterful),
      level: worker.masterful,
      type:7,
    })
  }

  if (!workers.length) return msg.reply({content:`No worker data, do \`idle wo\``});
  workers.sort((a,b) => { return b.power - a.power});


  let total = 0;
  if (workers.lengths < 3) {
    workers.forEach(x => {
      total += x.power;
    })
  } else {
    total = workers[0].power + workers[1].power + workers[2].power;
  }

  let string = "";

  for(let i = 0;i < (args[0] && args[0].toLowerCase() === 'top' ? 3 : workers.length);i++) {
    let w = workers[i];
    string += `${worker_data[type_to_name[w.type]].emoji} <:level:1139837622722777108> ${w.level} 💥 ${w.power.toFixed(2)}\n`;
  }

  string += `Top 3 Power: ${total.toFixed(2)}`;

  const newEmbed = new Discord.EmbedBuilder()
    .setDescription(string);
  
  msg.reply({embeds:[newEmbed]});
}

function get_power (type, level) {
  return (type + 2) * (1 + type/4) * (1 + level/2.5);
}

module.exports.help = {
  name: "worker",
  aliases: ["wo"]
}