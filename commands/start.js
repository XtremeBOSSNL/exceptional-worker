const User = require('../models/user');
const Discord = require('discord.js');

module.exports.run = async (bot, msg, args) => {
  let userid = msg.author.id;

  let us = await User.findOne({ user: userid }).exec();
  if (us) return msg.reply({content:"You've already registered with the bot"});

  const buttons = new Discord.ActionRowBuilder();

  buttons.addComponents(
    new Discord.ButtonBuilder()
      .setLabel('Yes')
      .setStyle(3)
      .setCustomId(`ew-start-${msg.author.id}-yes`),
    new Discord.ButtonBuilder()
      .setLabel('No')
      .setStyle(4)
      .setCustomId(`ew-start-${msg.author.id}-no`)
  )

  const newEmbed = new Discord.EmbedBuilder()
    .setDescription("Do you want to start your journey with the exceptional workers help?\n\n**IMPORTANT**\nThis bot will not work if you dont have a profile picture")
    .setTitle('Welcome');


  msg.reply({embeds:[newEmbed],components:[buttons]});
  const filter = inter => inter.user.id === msg.author.id && inter.customId.startsWith(`ew-start-${msg.author.id}-`);
  msg.channel.awaitMessageComponent({filter, max:1,time:120000})
      .then(int => {
        let action = int.customId.slice(`ew-start-${msg.author.id}-`.length);
        if (action === 'yes') {
          const newUser = new User({
            user:msg.author.id,
            tag:msg.author.username,
            info: {
              creation_date: Date.now(),
            }
          })
          newUser.save().catch(err=>console.log(err));
          int.reply({content:`Welcome to Excepional Worker\nCheckout \`ew settings\` to see the features you would like to use`});
        } else if (action === 'no') {
          int.reply({content:`Well thats a shame`});
        }
      })
      .catch(err => {
        console.log(err);
        interaction.followUp({content:`No response`});
      })
}

module.exports.help = {
  name: "start",
  aliases: []
}