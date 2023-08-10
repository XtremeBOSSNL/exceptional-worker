const User = require('../models/user');
const Discord = require('discord.js');
const Workers = require('../models/worker');

const worker_data = require('../data/workers.json').workers;

module.exports.run = async (bot, us, msg) => {
    let embed = msg.embeds[0];

    let worker = await Workers.findOne({ user:us.user }).exec();
    if (!worker) {
        worker = new Workers({
            user:us.user,
        })
    }

    await embed.fields.forEach(work => {
      let name = work.name.slice(4);
      let index = name.indexOf('worker:');
      let wname = name.substring(0,index);

      let value = work.value.slice('<:level:971671521196146688> **Level**: '.length);
      let index2 = value.indexOf(' `[');
      let level = parseInt(value.substring(0,index2));

      worker[wname] = level;
    });
    worker.save().catch(err=>console.log(err));
    us.data.lastWorkerCheck = Date.now();
    us.save().catch(err=>console.log(err));
    if (us.settings.raidHelper == false) return;
    msg.react('<:CheckMark:1011588182149697556>');
}

module.exports.help = {
  name: "workers",
  aliases: []
}