const User = require('../models/user');
const Energy = require('../models/energy');
const Discord = require('discord.js');

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

  let energy = await Energy.findOne({ user: userid }).exec();

  const response = await msg.reply(make_embed(us, energy));

  const collector = msg.channel.createMessageComponentCollector({ componentType: Discord.ComponentType.StringSelect, time: 1000 * 60 * 3});

  collector.on('collect', async i => {
    if (i.user.id != msg.author.id) return;
    const selection = i.values[0];
    if (i.customId == 'donor-tier') {
      if (donor_options.includes(selection)) {
        us.data.donorTier = donor_trans[selection];
        us.save().catch(err=>console.log(err));
        i.reply({content:`Succesfully set donor tier`, ephemeral: true});
      }
    } else if (i.customId == 'energy-regen') {
      let value = parseInt(selection);
      if (value >= 0 && value <= 7) {
        us.data.energyRegenUpgrade = value;
        us.save().catch(err=>console.log(err));
        i.reply({content:`Succesfully set energy regen upgrade`, ephemeral: true});
      }
    }
    await response.edit(make_embed(us, energy));
  });

  collector.on('end', () => {
    response.edit(make_embed(us, energy, 1))
  })
}

module.exports.help = {
  name: "energy",
  aliases: []
}


function make_embed(us, energy, expired) {
  const row1 = new Discord.ActionRowBuilder();
  const row2 = new Discord.ActionRowBuilder();

  row1.addComponents(
    new Discord.StringSelectMenuBuilder()
			.setCustomId('donor-tier')
			.setPlaceholder('Choose you Donor Tier')
			.addOptions(
        new Discord.StringSelectMenuOptionBuilder()
					.setLabel('None')
					.setDescription('The tier that gives you 0% enery recover')
					.setValue('none'),
				new Discord.StringSelectMenuOptionBuilder()
					.setLabel('Common')
					.setDescription('The tier that gives you +10% enery recover')
					.setValue('common'),
				new Discord.StringSelectMenuOptionBuilder()
					.setLabel('Talented')
					.setDescription('The tier that gives you +30% enery recover')
					.setValue('talented'),
				new Discord.StringSelectMenuOptionBuilder()
					.setLabel('Wise+')
					.setDescription('The tiers that gives you +55% enery recover')
					.setValue('wise'),
			),
  )

  row2.addComponents(
    new Discord.StringSelectMenuBuilder()
    .setCustomId('energy-regen')
    .setPlaceholder('Choose you Energy Regen Upgrade')
    .addOptions(
      new Discord.StringSelectMenuOptionBuilder()
        .setLabel('Level 0')
        .setDescription('The tier that gives you 0% enery recover')
        .setValue('0'),
      new Discord.StringSelectMenuOptionBuilder()
        .setLabel('Level 1')
        .setDescription('The tier that gives you +20% enery recover')
        .setValue('1'),
      new Discord.StringSelectMenuOptionBuilder()
        .setLabel('Level 2')
        .setDescription('The tier that gives you +35% energy recover')
        .setValue('2'),
      new Discord.StringSelectMenuOptionBuilder()
        .setLabel('Level 3')
        .setDescription('The tier that gives you +50% energy recover')
        .setValue('3'),
      new Discord.StringSelectMenuOptionBuilder()
        .setLabel('Level 4')
        .setDescription('The tier that gives you +60% energy recover')
        .setValue('4'),
        new Discord.StringSelectMenuOptionBuilder()
        .setLabel('Level 5')
        .setDescription('The tier that gives you +70% energy recover')
        .setValue('5'),
        new Discord.StringSelectMenuOptionBuilder()
        .setLabel('Level 6')
        .setDescription('The tier that gives you +75% energy recover')
        .setValue('6'),
        new Discord.StringSelectMenuOptionBuilder()
        .setLabel('Level 7')
        .setDescription('The tier that gives you +80% energy recover')
        .setValue('7'),
    )
  )

  let energy_string;
  if (energy && energy.active) {
    energy_string = (energy.energyFull/1000).toFixed(0);
  }

  const newEmbed = new Discord.EmbedBuilder()
    .setTitle('Energy Overview')
    .setDescription(`Donor Tier: ${donor_tiers[us.data.donorTier]}\n` +
      `Regen Upgrade: ${energy_upgrades[us.data.energyRegenUpgrade]}\n` +
      `Energy Cooldown: ${General.calc_energy_cooldown_display(us)}\n` +
      `Energy Full in: ${energy_string ? `<t:${energy_string}:R>` : "Unkown"}`
    );

  if (expired) newEmbed.setColor(Discord.Colors.Red);

  return {embeds:[newEmbed],components:[row1,row2]};
}