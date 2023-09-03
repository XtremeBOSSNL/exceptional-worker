const User = require('../models/user');
const Discord = require('discord.js');
const Energy = require('../models/energy');
const General = require('../modules/general');
const Market = require('../models/market');

const filter = ['wood','stick','apple','leaf','water','rock','sand', 'algae', 'potato', 'dirt', 'root', 
    'wheat', 'seed', 'bug', 'broken_bottle', 'gold_nugget', 'cotton', 'coal', 
    'iron_ore', 'copper_ore', 'dust', 'aluminium_ore',
    'milk', 'meat', 'leather', 'horn', 'sawdust'];

module.exports.run = async (bot, us, msg) => {
    let embed = msg.embeds[0];

    let date = new Date();
    let day = date.getUTCDate();
    let month = date.getUTCMonth();
    let year = date.getUTCFullYear();

    let market = await Market.findOne({day:day,month:month,year:year}).exec();
    if (!market) {
        market = new Market({
            day:day,
            month:month,
            year:year,
        });
    }

    let fitems = embed.fields;
    if (!fitems) return;

    fitems.forEach(item => {
        let name = />\s\*\*(.+)\*\*$/g.exec(item.name)?.[1] || ''
        if (!name) {
            name = />\s\*\*(.+)\*\*\s\s\|/g.exec(item.name)?.[1] || '';
        }
        name = name.replace(/ /g,"_");
        let price = /\*\*Price\*\*:\s(\d+)\s<:idlons:1086449232967372910>/g.exec(item.value)?.[1] || 0;
        if (!price) {
            let search = /\*\*Price\*\*:\s(\d+),(\d+)\s<:idlons:1086449232967372910>/g.exec(item.value);
            if (search && search[1] && search[2]) {
                price = (parseInt(search[1]) * 1000) + parseInt(search[2]);
            }
        }
        if (filter.includes(name) && price) {
            market.material[name] = price;
        }
    });
    market.save().catch(err=>console.log(err));
}

module.exports.help = {
  name: "market",
  aliases: []
}