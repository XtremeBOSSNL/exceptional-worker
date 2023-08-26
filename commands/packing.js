const User = require('../models/user');
const Energy = require('../models/energy');
const Discord = require('discord.js');
const Hire = require('../models/hire');
const General = require('../modules/general');
const worker_data = require('../data/workers.json').workers;
const Market = require('../models/market');
const packing_data = require('../data/packing.json').boxes;


module.exports.run = async (bot, msg, args) => {
  let userid = msg.author.id;

  let us = await User.findOne({ user: userid }).exec();
  if (!us) return msg.reply({ content: "You've not registed with this bot \`ew start\`" });

  let date = new Date();
  let day = date.getUTCDate();
  let month = date.getUTCMonth();
  let year = date.getUTCFullYear();

  let market = await Market.findOne({day:day,month:month,year:year}).exec();
  if (!market) return msg.reply({ content: `Market data is not known for today. use \`idle market\` and go through all material pages` });
  if (check_market_data_missing(market)) return msg.reply({ content: `Market data is not known for today. use \`idle market\` and go through all material pages` });

  let emb = make_embeds(market);
  const regEmbed = make_global_embed(emb[0], 0);
  const donorEmbed = make_global_embed(emb[1], 1);

  let response;
  if (us.data.donorTier > 0) {
    response = await msg.reply(donorEmbed);
  } else {
    response = await msg.reply(regEmbed);
  }

  const collector = msg.channel.createMessageComponentCollector({ componentType: Discord.ComponentType.Button, time: 1000 * 60 * 3 });

  collector.on('collect', async i => {
    if (i.user.id != msg.author.id) return;

    if (i.customId.startsWith('market-')) {
      if (i.customId == 'market-donor') {
        await response.edit(donorEmbed);
      } else if (i.customId == 'market-reg') {
        await response.edit(regEmbed);
      }
    }
    i.reply({ content: `Succesfully changed overview`, ephemeral: true })
  });
}

module.exports.help = {
  name: "packing",
  aliases: ["p","market"]
}


function make_global_embed(embed, donor, expired) {
  const row1 = new Discord.ActionRowBuilder();

  if (donor) {
    row1.addComponents(
      new Discord.ButtonBuilder()
        .setCustomId('market-reg')
        .setLabel('Switch to F2P view')
        .setStyle(Discord.ButtonStyle.Secondary)
    )
  } else {
    row1.addComponents(
      new Discord.ButtonBuilder()
        .setCustomId('market-donor')
        .setLabel('Switch to Donor view')
        .setStyle(Discord.ButtonStyle.Secondary)
    )
  }

  if (expired) embed.setColor(Discord.Colors.Red);

  return { embeds: [embed], components: [row1] };
}

function make_embeds(market) {
  let data = make_data(market);

  data.sort((a, b) => { return b.regProfit - a.regProfit});
  let reg = make_embed(market, data, 0);
  data.sort((a, b) => { return b.donorProfit - a.donorProfit});
  let donor = make_embed(market,  data, 1);
  return [reg, donor];
}

const all_materials = ['wood','stick','apple','leaf','water','rock','sand', 'algae', 'potato', 'dirt', 'root', 
    'wheat', 'seed', 'bug', 'broken_bottle', 'gold_nugget', 'cotton', 'coal', 
    'iron_ore', 'copper_ore', 'dust', 'aluminium_ore',
    'milk', 'meat', 'leather', 'horn', 'sawdust'];

function make_data(market) {
  let array = [];
  all_materials.forEach(mat => {
    let obj = {};
    obj.name = mat;
    obj.cost = market.material[mat] * 100;
    obj.sell = packing_data[mat];
    obj.regProfit = (obj.sell * 0.9) - obj.cost;
    obj.donorProfit = (obj.sell * 0.95) - obj.cost;
    array.push(obj);
  });
  return array;
}

function make_embed(market, data, donor) {
  let string = '';
  for(let i = 0;i < 10;i++) {
    string += `${i+1}. ${data[i].name} ${donor ? `${data[i].donorProfit}` : `${data[i].regProfit}`} <:idlons:1136627361564078161>\n`;
  }

  const newEmbed = new Discord.EmbedBuilder()
    .setTitle(`${donor ? 'Donor' : 'F2P'} Packing Profit`)
    .setDescription(`**Profit Per Worker Token**\n${string}`)
    .setFooter({text:`Data from ${market.day}-${market.month+1}-${market.year} UTC`});
  return newEmbed;
}

function check_market_data_missing (market) {
  let missing = 0;
  all_materials.forEach(mats => {
    if (market.material[mats] == 0) {
      missing++;
    }
  })

  return missing ? true : false;
}