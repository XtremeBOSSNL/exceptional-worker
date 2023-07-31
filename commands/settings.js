const User = require('../models/user');
const Discord = require('discord.js');

module.exports.run = async (bot, msg, args) => {
  let userid = msg.author.id;

  let us = await User.findOne({ user: userid }).exec();
  if (!us) return msg.reply({content:"You've not registed with this bot \`ew start\`"});

  const response = await msg.reply(make_embed(us));

  const collector = msg.channel.createMessageComponentCollector({ componentType: Discord.ComponentType.Button, time: 1000 * 60 * 3});

  collector.on('collect', async i => {
    if (i.user.id != msg.author.id) return;
    
    if (i.customId.startsWith('settings-')) {
      if (i.customId == 'settings-energy-on') {
          us.settings.energyReminder = true;
          us.save().catch(err=>console.log(err));
          i.reply({content:`Succesfully turned energy reminders on`, ephemeral: true});
      } else if (i.customId == 'settings-energy-off') {
          us.settings.energyReminder = false;
          us.save().catch(err=>console.log(err));
          i.reply({content:`Succesfully turned energy reminders off`, ephemeral: true});
      } else if (i.customId == 'settings-raidh-on') {
          us.settings.raidHelper = true;
          us.save().catch(err=>console.log(err));
          i.reply({content:`Succesfully turned raid helper on`, ephemeral: true});
      } else if (i.customId == 'settings-raidh-off') {
          us.settings.raidHelper = false;
          us.save().catch(err=>console.log(err));
          i.reply({content:`Succesfully turned raid helper off`, ephemeral: true});
      } else if (i.customId == 'settings-claim-on') {
          us.settings.claimReminder = true;
          us.save().catch(err=>console.log(err));
          i.reply({content:`Succesfully turned claim reminder on`, ephemeral: true});
      } else if (i.customId == 'settings-claim-off') {
          us.settings.claimReminder = false;
          us.save().catch(err=>console.log(err));
          i.reply({content:`Succesfully turned claim reminder off`, ephemeral: true});
      } else if (i.customId == 'settings-hire-on') {
          us.settings.trackHire = true;
          us.save().catch(err=>console.log(err));
          i.reply({content:`Succesfully turned hire tracker on`, ephemeral: true});
      } else if (i.customId == 'settings-hire-off') {
          us.settings.trackHire = false;
          us.save().catch(err=>console.log(err));
          i.reply({content:`Succesfully turned hire tracker off`, ephemeral: true});
      }
    }
    await response.edit(make_embed(us));
  });

  collector.on('end', () => {
    response.edit(make_embed(us, 1))
  })
}

module.exports.help = {
  name: "settings",
  aliases: ["set"]
}


function make_embed(us, expired) {
  const row1 = new Discord.ActionRowBuilder();

  if (us.settings.energyReminder) {
    row1.addComponents(
        new Discord.ButtonBuilder()
        .setLabel('Turn Energy Reminder Off')
        .setCustomId('settings-energy-off')
        .setStyle(Discord.ButtonStyle.Danger)
    )
  } else {
    row1.addComponents(
        new Discord.ButtonBuilder()
        .setLabel('Turn Energy Reminder On')
        .setCustomId('settings-energy-on')
        .setStyle(Discord.ButtonStyle.Success)
    )
  }

  if (us.settings.raidHelper) {
    row1.addComponents(
        new Discord.ButtonBuilder()
        .setLabel('Turn Raid Helper Off')
        .setCustomId('settings-raidh-off')
        .setStyle(Discord.ButtonStyle.Danger)
    )
  } else {
    row1.addComponents(
        new Discord.ButtonBuilder()
        .setLabel('Turn Raid Helper On')
        .setCustomId('settings-raidh-on')
        .setStyle(Discord.ButtonStyle.Success)
    )
  }

  if (us.settings.claimReminder) {
    row1.addComponents(
        new Discord.ButtonBuilder()
        .setLabel('Turn Claim Reminder Off')
        .setCustomId('settings-claim-off')
        .setStyle(Discord.ButtonStyle.Danger)
    )
  } else {
    row1.addComponents(
        new Discord.ButtonBuilder()
        .setLabel('Turn Claim Reminder On')
        .setCustomId('settings-claim-on')
        .setStyle(Discord.ButtonStyle.Success)
    )
  }

  if (us.settings.trackHire) {
    row1.addComponents(
        new Discord.ButtonBuilder()
        .setLabel('Turn Hire Tracker Off')
        .setCustomId('settings-hire-off')
        .setStyle(Discord.ButtonStyle.Danger)
    )
  } else {
    row1.addComponents(
        new Discord.ButtonBuilder()
        .setLabel('Turn Hire Tracker On')
        .setCustomId('settings-hire-on')
        .setStyle(Discord.ButtonStyle.Success)
    )
  }

  const newEmbed = new Discord.EmbedBuilder()
    .setTitle('Settings Overview')
    .setDescription(`**Energy Reminder:** ${us.settings.energyReminder ? 'On' : 'Off'}\n` +
        `\`ew energy\` to configure your energy regen\n` +
        `**Raid Helper:** ${us.settings.raidHelper ? 'On' : 'Off'}\n` +
        `\`idle wo\` so the bot can see your workers\n`+
        `\`ew raid\` to configure the embed the helper provides \n` +
        `**Claim Reminder:** ${us.settings.claimReminder ? 'On' : 'Off'}\n` +
        `\`ew claim\` to configure your claim reminder\n` +
        `**Hire Tracker:** ${us.settings.trackHire ? 'On' : 'Off'}\n` +
        `\`ew hire\` to see your hire stats\n`
    );

  if (expired) newEmbed.setColor(Discord.Colors.Red);

  return {embeds:[newEmbed],components:[row1]};
}