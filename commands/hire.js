const User = require('../models/user');
const Energy = require('../models/energy');
const Discord = require('discord.js');
const Hire = require('../models/hire');
const General = require('../modules/general');
const worker_data = require('../data/workers.json').workers;


module.exports.run = async (bot, msg, args) => {
  let userid = msg.author.id;

  let us = await User.findOne({ user: userid }).exec();
  if (!us) return msg.reply({ content: "You've not registed with this bot \`ew start\`" });
  if (us.settings.trackHire == false) return msg.reply({ content: `You've not turned on Hire Tracker in settings` });

  let hire = await Hire.findOne({ user: userid }).exec();
  if (!hire) return msg.reply({ content: `You've not rolled after turning on the setting` });

  let global_hire = await Hire.aggregate([
    { $group: {  
      _id: null, 
      total: { $sum: "$total" },
      useless: { $sum: "$useless" },
      deficient: { $sum: "$deficient" },
      common: { $sum: "$common" },
      talented: { $sum: "$talented" },
      wise: { $sum: "$wise" },
      expert: { $sum: "$expert" },
      masterful: { $sum: "$masterful" },
     } }
  ]).exec();

  const personalEmbed = make_personal_embed(us, hire);
  const globalEmbed = make_global_embed(us, global_hire[0]);

  const response = await msg.reply(personalEmbed);

  const collector = msg.channel.createMessageComponentCollector({ componentType: Discord.ComponentType.Button, time: 1000 * 60 * 3 });

  collector.on('collect', async i => {
    if (i.user.id != msg.author.id) return;

    if (i.customId.startsWith('hire-')) {
      if (i.customId == 'hire-global') {
        await response.edit(globalEmbed);
      } else if (i.customId == 'hire-personal') {
        await response.edit(personalEmbed);
      }
    }
    i.reply({ content: `Succesfully changed overview`, ephemeral: true })
  });

  collector.on('end', () => {
    response.edit(make_personal_embed(us, hire, 1))
  });
}

module.exports.help = {
  name: "hire",
  aliases: []
}


function make_personal_embed(us, hire, expired) {
  const row1 = new Discord.ActionRowBuilder();

  row1.addComponents(
    new Discord.ButtonBuilder()
      .setCustomId('hire-global')
      .setLabel('Switch to global view')
      .setStyle(Discord.ButtonStyle.Secondary)
  )

  const newEmbed = new Discord.EmbedBuilder()
    .setTitle('Personal Hire Overview')
    .setDescription(make_desc(hire));

  if (expired) newEmbed.setColor(Discord.Colors.Red);

  return { embeds: [newEmbed], components: [row1] };
}

function make_global_embed(us, stats, expired) {
  const row1 = new Discord.ActionRowBuilder();

  row1.addComponents(
    new Discord.ButtonBuilder()
      .setCustomId('hire-personal')
      .setLabel('Switch to personal view')
      .setStyle(Discord.ButtonStyle.Secondary)
  )

  const newEmbed = new Discord.EmbedBuilder()
    .setTitle('Global Hire Overview')
    .setDescription(make_desc(stats));

  if (expired) newEmbed.setColor(Discord.Colors.Red);

  return { embeds: [newEmbed], components: [row1] };
}

let rarities = ['masterful', 'expert', 'wise', 'talented', 'common', 'deficient', 'useless'];

function make_desc(stats) {
  let total = stats.total;
  let string = '';

  rarities.forEach(r => {
    string += `${worker_data[r].emoji} **${stats[r]}** (${((stats[r] / total) * 100).toFixed(2)}%)\n`;
  })
  string += `Total rolled: ${total}`;
  return string;
}