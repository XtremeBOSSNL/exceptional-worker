const User = require('../models/user');
const Discord = require('discord.js');
const RaidSolution = require('../models/raidSolution');
const Hire = require('../models/hire');

module.exports.run = async (bot, msg, args) => {
  let userid = msg.author.id;

  let us = await User.findOne({ user: userid }).exec();
  if (!us) return msg.reply({content:"You've not registed with this bot \`ew start\`"});


  let usercount =  await User.countDocuments({}).exec();
  let raidcount = await RaidSolution.countDocuments({}).exec();
  let workercount = await Hire.aggregate([
    { $group: {  
      _id: null, 
      total: { $sum: "$total" },
     } }
  ]).exec();

  const row1 = new Discord.ActionRowBuilder();

  row1.addComponents(
      new Discord.ButtonBuilder()
      .setLabel('Add the bot')
      .setURL('https://discord.com/api/oauth2/authorize?client_id=1134098983397101618&permissions=137439332416&scope=bot%20applications.commands')
      .setStyle(Discord.ButtonStyle.Link)
  )
  row1.addComponents(
    new Discord.ButtonBuilder()
    .setLabel('Join Support Server')
    .setURL('https://discord.gg/Ksw8YaPhjF')
    .setStyle(Discord.ButtonStyle.Link)
  )
  const newEmbed = new Discord.EmbedBuilder()
    .setTitle('Info')
    .addFields(
      {
        name:"Uptime",
        value:`${uptime(bot.uptime)}`,
        inline:true,
      },
      {
        name:"Servers",
        value:`${bot.guilds.cache.size}`,
        inline:true,
      },
      {
        name:"Owner",
        value:"<@258876599594778627>\n(258876599594778627)",
        inline:true,
      },
      {
        name:"Users",
        value:`${usercount}`,
        inline:true,
      },
      {
        name:"Unique Raid Solutions",
        value:`${raidcount} (137665)`,
        inline:true,
      },
      {
        name:"Worker Rolls Tracked",
        value:`${workercount[0].total}`,
        inline:true,
      }
    )
  
  msg.reply({embeds:[newEmbed],components:[row1]}).catch(err=>console.log(err));
}

function uptime (time) {
  let sec = 0;
  let min = 0;
  let hour = 0;
  let days = 0;
  let months = 0;
  time /= 1000; //seconds
  time = time.toFixed(0);
  if (time < 60) return `${time}s`;
  while (time > 60) {
    time -= 60;
    min++;
  }
  sec = time;
  if (min < 60) return `${min}m ${sec}s`;
  while (min > 60) {
    min -= 60;
    hour++;
  }
  if (hour < 24) return `${hour}h ${min}m ${sec}s`;
  while (hour > 24) {
    hour -= 24;
    days++;
  }
  if (days < 31) return `${days}d ${hour}h ${min}m ${sec}s`;
  while (days > 31) {
    days -= 31;
    months++;
  }
  return `${months}m ${days}d ${hour}h ${min}m ${sec}s`
}


module.exports.help = {
  name: "info",
  aliases: ["i","stats"]
}