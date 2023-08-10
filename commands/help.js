const User = require('../models/user');
const Discord = require('discord.js');

module.exports.run = async (bot, msg, args) => {
  let userid = msg.author.id;

  let us = await User.findOne({ user: userid }).exec();
  if (!us) return msg.reply({content:"You've not registed with this bot \`ew start\`"});



  const row1 = new Discord.ActionRowBuilder();

  row1.addComponents(
      new Discord.ButtonBuilder()
      .setLabel('Add the bot')
      .setURL('https://discord.com/api/oauth2/authorize?client_id=1134098983397101618&permissions=137439332416&scope=bot%20applications.commands')
      .setStyle(Discord.ButtonStyle.Link)
  )

  const newEmbed = new Discord.EmbedBuilder()
    .setTitle('Help')
    .addFields(
      {
        name:"Commmands",
        value:`\`ew start\` Starts your journey with the bot\n` +
        `\`ew settings\` Configure the settings you want to use in the bot\n` +
        `\`ew energy\` Configure your Energy Reminder\n` +
        `\`ew claim\` Configure your Claim Reminder\n` +
        `\`ew raid\` Configure Your Raid Helper\n` + 
        `\`ew lastclaim\` Shows how long ago you've claimed\n` +
        `\`ew hire\` Shows your worker roll stats\n` +
        `\`ew info\` Shows some info about the bot\n` +
        `\`ew guild\` Shows guild commands for guild owners\n`
      }
    )
  
  msg.reply({embeds:[newEmbed],components:[row1]});
}

module.exports.help = {
  name: "help",
  aliases: ["h"]
}