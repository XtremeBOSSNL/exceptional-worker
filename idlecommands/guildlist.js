const User = require('../models/user');
const Discord = require('discord.js');
const Energy = require('../models/energy');
const General = require('../modules/general');
const Guilds = require('../models/guild');

module.exports.run = async (bot, us, msg) => {
    let embed = msg.embeds[0];
    if (!embed) return;

    let footer = embed.data?.footer?.text;
    if (!footer) return;
    let owner = /^Owner:\s(.+)$/g.exec(footer)?.[1] || '';
    if (!owner) return;
    let o = await msg.guild.members.fetch({query:owner, limit:1}).catch(err=>console.log(err));
    if (!o) return;
    let ow = o.first();
    if (!ow) return;

    // us = await User.findOne({user:ow.user.id}).exec();
    // if (!us) return;

    let guild = /^\*\*(.+)\*\*\smembers$/g.exec(embed.data?.fields[0]?.name || '')?.[1] || '';
    if (!guild) return;

    let g = await Guilds.findOne({name:guild}).exec();
    if (!g) {
        g = new Guilds({
            name:guild,
        })
    }
    g.owner = ow.user.id;

    let members = [];
    let us_m = [];
    for (let i = 0; i < embed.fields.length;i++) {
        let m = embed.fields[i].value.split('\n');
        for (let ii = 0; ii < m.length;ii++) {
            let id = /^ID:\s\*\*(\d+)\*\*$/g.exec(m[ii])?.[1] || '';
            if (id) {
                members.push(id);
            } else {
                let after = /\*\*(.+)\*\*/g.exec(m[ii])[1];
                let me = await General.get_member_by_username(msg.guild, after);
                members.push(me.user.id);
            }
        }
    }
    // await embed.fields.forEach(async field => {
    //     let m = field.value.split('\n');
    //     await m.forEach(async mem => {
    //         let id = /^ID:\s\*\*(\d+)\*\*$/g.exec(mem)?.[1] || '';
    //         if (id) {
    //             members.push(id);
    //         } else {
    //             let after = /\*\*(.+)\*\*/g.exec(mem)[1];
    //             // let m = await msg.guild.members.fetch({query:after, limit:1}).catch(err=>console.log(err));
    //             // console.log(m.first().user.id);
    //             us_m.push(after);
    //         }
    //     })
    // });
    // let ms = await msg.guild.members.fetch({query:us_m.join('+')}).catch(err=>console.log(err));
    // console.log(ms);
    
    // console.log(members);
    g.members = members;
    g.save().catch(err=>console.log(err));
    msg.react('<:CheckMark:1011588182149697556>');
}

module.exports.help = {
  name: "guild list",
  aliases: []
}