const User = require('../models/user');
const Energy = require('../models/energy');
const Discord = require('discord.js');
const Claim = require('../models/claim');

const General = require('../modules/general');
const donor_tiers = ["None","+10%","+30%","+55%"];
const energy_upgrades = ["None","+20%","+35%","+50%","+60%","+70%","+75%","+80%"];

const donor_options = ['none', 'common', 'talented', 'wise'];
const donor_trans = {
  none: 0,
  common: 1,
  talented: 2,
  wise: 3,
}

module.exports.run = async (bot, msg, args) => {
  let userid = msg.author.id;

  let us = await User.findOne({ user: userid }).exec();
  if (!us) return msg.reply({content:"You've not registed with this bot \`ew start\`"});
  if (us.settings.claimReminder == false) return msg.reply(`You've not turned on Claim Reminder in settings`);

  let claim = await Claim.findOne({ user: userid }).exec();

  const response = await msg.reply(make_embed(us, claim));

  const collector = msg.channel.createMessageComponentCollector({ componentType: Discord.ComponentType.StringSelect, time: 1000 * 60 * 3});

  collector.on('collect', async i => {
    if (i.user.id != msg.author.id) return;
    const selection = i.values[0];
    if (i.customId == 'claim-reminder') {
      let value = parseInt(selection);
      if (value >= 0 && value <= 24) {
        us.data.lastClaimHours = value;
        us.save().catch(err=>console.log(err));
        i.reply({content:`Succesfully set claim reminder time`, ephemeral: true});
      }
    }
    await response.edit(make_embed(us, claim));
  });

  collector.on('end', () => {
    response.edit(make_embed(us, claim, 1));
  })
}

module.exports.help = {
  name: "claim",
  aliases: []
}


function make_embed(us, claim, expired) {
  const row1 = new Discord.ActionRowBuilder();

  row1.addComponents(
    new Discord.StringSelectMenuBuilder()
    .setCustomId('claim-reminder')
    .setPlaceholder('Choose you Claim Reminder Time')
    .addOptions(
      new Discord.StringSelectMenuOptionBuilder()
        .setLabel('No Time')
        .setDescription('I just want acces to ew lastclaim')
        .setValue('0'),
      new Discord.StringSelectMenuOptionBuilder()
        .setLabel('1 Hour')
        .setDescription('Be Reminded 1 Hour after claiming')
        .setValue('1'),
      new Discord.StringSelectMenuOptionBuilder()
        .setLabel('2 Hours')
        .setDescription('Be Reminded 2 Hours after claiming')
        .setValue('2'),
      new Discord.StringSelectMenuOptionBuilder()
        .setLabel('4 Hours')
        .setDescription('Be Reminded 4 Hours after claiming')
        .setValue('4'),
      new Discord.StringSelectMenuOptionBuilder()
        .setLabel('8 Hours')
        .setDescription('Be Reminded 8 Hours after claiming')
        .setValue('8'),
        new Discord.StringSelectMenuOptionBuilder()
        .setLabel('12 Hours')
        .setDescription('Be Reminded 12 Hours after claiming')
        .setValue('12'),
        new Discord.StringSelectMenuOptionBuilder()
        .setLabel('18 Hours')
        .setDescription('Be Reminded 16 Hours after claiming')
        .setValue('18'),
        new Discord.StringSelectMenuOptionBuilder()
        .setLabel('24 Hours')
        .setDescription('Be Reminded 24 Hours after claiming')
        .setValue('24'),
    )
  )

  let last_claim_string;
  let claim_string;
  if (us.data.lastClaim > 0) {
    last_claim_string = (us.data.lastClaim/1000).toFixed(0);
  }
  if (claim && claim.active) {
    claim_string = (claim.claimReminder/1000).toFixed(0);
  }

  const newEmbed = new Discord.EmbedBuilder()
    .setTitle('Claim Overview')
    .setDescription(`Reminder Set: ${us.data.lastClaimHours ? `${us.data.lastClaimHours} Hours` : 'No Time set'}\n` +
      `Reminder Scheduled for: ${claim_string ? `<t:${claim_string}:R>` : "Unknown"}\n` +
      `Last Energy Claim: ${last_claim_string ? `<t:${last_claim_string}:R>` : "Unknown"}`
    );

  if (expired) newEmbed.setColor(Discord.Colors.Red);

  return {embeds:[newEmbed],components:[row1]};
}