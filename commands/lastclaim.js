const User = require('../models/user');
const Discord = require('discord.js');


module.exports.run = async (bot, msg, args) => {
  let userid = msg.author.id;

  let us = await User.findOne({ user: userid }).exec();
  if (!us) return msg.reply({content:"You've not registed with this bot \`ew start\`"});
  if (us.settings.claimReminder == false) return msg.reply({content:`You've not turned on Claim Reminder in settings`});
  if (!us.data.lastClaim) return msg.reply({content:`No last claim known`});

  const newEmbed = new Discord.EmbedBuilder()
    .setDescription(`Time since claim: ${format_time(us.data.lastClaim)}`);
  msg.reply({embeds:[newEmbed]});
}

module.exports.help = {
  name: "lastclaim",
  aliases: ["lc"]
}


const time_trans = {
  day:60*60*24,
  hour:60*60,
  min:60,
  sec:1,
}


function format_time (time) {
  time = Date.now() - time;
  time = parseInt(time/1000);
  let day = 0;
  let hour = 0;
  let min = 0;
  let sec = 0;

  while (time > time_trans.day) {
    day++;
    time -= time_trans.day;
  }
  while (time > time_trans.hour) {
    hour++;
    time -= time_trans.hour;
  }
  while (time > time_trans.min) {
    min++;
    time -= time_trans.min;
  }
  sec = time;

  return (day ? `${day}d ` : '') + (hour ? `${hour}h ` : '') + (min ? `${min}m ` : '') + (sec ? `${sec}s ` : '');
}