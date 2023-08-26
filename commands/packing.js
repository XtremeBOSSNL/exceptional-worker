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

  let emb = make_embeds(us, market);
  let regEmbed = make_global_embed(us, emb[0], 0);
  let donorEmbed = make_global_embed(us, emb[1], 1);


  let current_embed = '';
  let response;
  if (us.data.donorTier > 0) {
    current_embed = 'donor';
    response = await msg.reply(donorEmbed);
  } else {
    current_embed = 'f2p';
    response = await msg.reply(regEmbed);
  }

  const collector = msg.channel.createMessageComponentCollector({ componentType: Discord.ComponentType.Button, time: 1000 * 60 * 3 });

  collector.on('collect', async i => {
    if (i.user.id != msg.author.id) return;

    if (i.customId.startsWith('market-')) {
      if (i.customId == 'market-donor') {
        current_embed = 'donor';
        await response.edit(donorEmbed);
      } else if (i.customId == 'market-reg') {
        current_embed = 'f2p';
        await response.edit(regEmbed);
      } else if (i.customId.startsWith('market-packing-')) {
        if (i.customId == 'market-packing-minus') {
          us.data.packingMulti--;
          if (us.data.packingMulti < 0) us.data.packingMulti = 0;
          us.save().catch(err=>console.log(err));
          let emb = make_embeds(us, market);
          regEmbed = make_global_embed(us, emb[0], 0);
          donorEmbed = make_global_embed(us, emb[1], 1);
        } else if (i.customId == 'market-packing-plus') {
          us.data.packingMulti++;
          if (us.data.packingMulti > 100) us.data.packingMulti = 100;
          us.save().catch(err=>console.log(err));
          let emb = make_embeds(us, market);
          regEmbed = make_global_embed(us, emb[0], 0);
          donorEmbed = make_global_embed(us, emb[1], 1);
        }
        if (current_embed == 'donor') {
          await response.edit(donorEmbed);
        } else {
          await response.edit(regEmbed);
        }
      }
    }
    i.reply({ content: `Succesfully changed overview`, ephemeral: true })
  });
}

module.exports.help = {
  name: "packing",
  aliases: ["p","market"]
}


function make_global_embed(us, embed, donor, expired) {
  const row1 = new Discord.ActionRowBuilder();

  row1.addComponents(
    new Discord.ButtonBuilder()
      .setCustomId('market-packing-minus')
      .setEmoji('➖')
      .setStyle(Discord.ButtonStyle.Secondary),
      new Discord.ButtonBuilder()
      .setCustomId('market-packing-status')
      .setLabel(`${us.data.packingMulti}%`)
      .setStyle(Discord.ButtonStyle.Primary)
      .setDisabled(true),
      new Discord.ButtonBuilder()
      .setCustomId('market-packing-plus')
      .setEmoji('➕')
      .setStyle(Discord.ButtonStyle.Secondary)
  )

  if (us.data.packingMulti <= 0) {
    row1.components[0].setDisabled(true);
  }
  if (us.data.packingMulti >= 100) {
    row1.components[2].setDisabled(true);
  }

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

function make_embeds(us, market) {
  let data = make_data(us, market);

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

function make_data(us, market) {
  let array = [];
  all_materials.forEach(mat => {
    let obj = {};
    obj.name = mat;
    obj.cost = market.material[mat] * 100;
    obj.sell = packing_data[mat] * (1 + us.data.packingMulti * 0.01);
    obj.regProfit = (obj.sell * 0.9) - obj.cost;
    obj.donorProfit = (obj.sell * 0.95) - obj.cost;
    array.push(obj);
  });
  return array;
}

function make_embed(market, data, donor) {
  let string = '';
  for(let i = 0;i < 10;i++) {
    string += `${i+1}. ${data[i].name} ${donor ? `${data[i].donorProfit.toFixed(0)}` : `${data[i].regProfit.toFixed(0)}`} <:idlons:1136627361564078161>\n`;
  }

  const newEmbed = new Discord.EmbedBuilder()
    .setTitle(`${donor ? 'Donor' : 'F2P'} Packing Profit`)
    .setDescription(`**Profit Per Worker Token**\n${string}*Set your own packing multiplier below with the - and + buttons*`)
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