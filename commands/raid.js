const User = require('../models/user');
const Discord = require('discord.js');

module.exports.run = async (bot, msg, args) => {
  let userid = msg.author.id;

  let us = await User.findOne({ user: userid }).exec();
  if (!us) return msg.reply({content:"You've not registed with this bot \`ew start\`"});

  if (us.settings.raidHelper == false) return msg.reply(`You've not turned on Raid Helper in settings`); 

  const response = await msg.reply(make_embed(us));

  const collector = msg.channel.createMessageComponentCollector({ componentType: Discord.ComponentType.Button, time: 1000 * 60 * 3});

  collector.on('collect', async i => {
    if (i.user.id != msg.author.id) return;
    
    if (i.customId.startsWith('settings-')) {
      if (i.customId == 'settings-simple-on') {
          us.settings.raidSimpleMode = true;
          us.save().catch(err=>console.log(err));
          i.reply({content:`Succesfully turned Raid Simple mode on`, ephemeral: true});
      } else if (i.customId == 'settings-simple-off') {
          us.settings.raidSimpleMode = false;
          us.save().catch(err=>console.log(err));
          i.reply({content:`Succesfully turned Raid Simple Mode off`, ephemeral: true});
      } else if (i.customId == 'settings-emoji-on') {
          us.settings.raidWorkerEmoji = true;
          us.save().catch(err=>console.log(err));
          i.reply({content:`Succesfully turned Worker as Emoji on`, ephemeral: true});
      } else if (i.customId == 'settings-emoji-off') {
          us.settings.raidWorkerEmoji = false;
          us.save().catch(err=>console.log(err));
          i.reply({content:`Succesfully turned Worker as Emoji off`, ephemeral: true});
      }
    }
    await response.edit(make_embed(us));
  });

  collector.on('end', () => {
    response.edit(make_embed(us, 1))
  })
}

module.exports.help = {
  name: "raid",
  aliases: []
}


function make_embed(us, expired) {
  const row1 = new Discord.ActionRowBuilder();

  if (us.settings.raidSimpleMode) {
    row1.addComponents(
        new Discord.ButtonBuilder()
        .setLabel('Turn Raid Simple Mode Off')
        .setCustomId('settings-simple-off')
        .setStyle(Discord.ButtonStyle.Danger)
    )
  } else {
    row1.addComponents(
        new Discord.ButtonBuilder()
        .setLabel('Turn Raid Simple Mode On')
        .setCustomId('settings-simple-on')
        .setStyle(Discord.ButtonStyle.Success)
    )
  }

  if (us.settings.raidWorkerEmoji) {
    row1.addComponents(
        new Discord.ButtonBuilder()
        .setLabel('Turn Worker as Emoji Off')
        .setCustomId('settings-emoji-off')
        .setStyle(Discord.ButtonStyle.Danger)
    )
  } else {
    row1.addComponents(
        new Discord.ButtonBuilder()
        .setLabel('Turn Worker as Emoji On')
        .setCustomId('settings-emoji-on')
        .setStyle(Discord.ButtonStyle.Success)
    )
  }

  const newEmbed = new Discord.EmbedBuilder()
    .setTitle('Settings Overview')
    .setDescription(`**Raid Simple Mode:** ${us.settings.raidSimpleMode? 'On' : 'Off'}\n` +
        `**Worker as Emoji:** ${us.settings.raidWorkerEmoji ? 'On' : 'Off'}\n` +
        `*If worker as emoji is off, workers will be displayed with letters*`
    );

  if (expired) newEmbed.setColor(Discord.Colors.Red);

  return {embeds:[newEmbed],components:[row1]};
}