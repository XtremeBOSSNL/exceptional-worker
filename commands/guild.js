const User = require('../models/user');
const Discord = require('discord.js');
const Guilds = require('../models/guild');
const Workers = require('../models/worker');
const worker = require('../models/worker');

module.exports.run = async (bot, msg, args) => {
  let userid = msg.author.id;

  let us = await User.findOne({ user: userid }).exec();
  if (!us) return msg.reply({content:"You've not registed with this bot \`ew start\`"});
  
  let guild = await Guilds.findOne({owner:us.user}).exec();
  if (!guild) return msg.reply({content:`You are not the guild owner, or haven't dont \`idle guild list\` yet`});


  let command;
  if (args.length) {
    command = args.shift().toLowerCase();
  }

  switch (command) {
    case "setpower":
      set_power_req(bot, guild, msg, args);
      break;
    case "setlife":
      life(bot, guild, msg, args);
      break;
    case "check":
      check_req(bot, guild, msg, args);
      break;
    case "delete":
      delete_data(bot, guild, msg, args);
      break;
    case "life":
      check_life(bot, guild, msg, args);
      break;
    case "power":
      power_embed(bot, guild, msg, args);
      break;
    default:
      guild_help(bot, guild, msg, args);
      break;
  }

}


function set_power_req(bot, guild, msg, args) {
  let req = parseInt(args.shift());
  if (!req && req != 0) return msg.reply({content:`No power amount provided`});
  if (req < 0) return msg.reply({content:`Negative numbers not allowed`});
  if (req > 500) return msg.reply({content:`Thats a little much dont u think so?`});

  guild.power_req = req;
  guild.save().catch(err=>console.log(err));
  msg.reply({content:`Power requirement set to ${req}`});
}

function life(bot, guild, msg, args) {
  let req = parseInt(args.shift());
  if (!req && req != 0) return msg.reply({content:`No farm life upgrade amount provided`});
  if (req < 0) return msg.reply({content:`Negative numbers not allowed`});
  if (req > 3) return msg.reply({content:`Thats a little much dont u think so?`});

  guild.farmLife_req = req;
  guild.save().catch(err=>console.log(err));
  msg.reply({content:`Farm life requirement set to ${req}`});
}

async function check_req(bot, guild, msg, args) {
  let members = guild.members;

  let guild_members = await User.find({user:{$in:members}}).exec();
  let guild_workers = await Workers.find({user:{$in:members}}).exec();

  let string = '';
  let string_b = '';
  let string_c = '';
  let string_d = '';
  let good = [];
  let not_registered = [];
  let no_workers = [];
  let worker_data = [];
  for (let i = 0;i < members.length;i++) {
    let m = members[i];
    let g_m = guild_members.find(x => x.user == m);
    if (g_m) {
      let w_m = guild_workers.find(x => x.user == m);
      if (w_m) {
        let power = check_top_power(w_m);
        if (power >= guild.power_req) {
          good.push(m);
        } else {
          worker_data.push(w_m);
          // if (string_c.length > 900) {
          //   string_d += `<@${m}> Power: ${power.toFixed(2)}, Last Check: ${g_m.data.lastWorkerCheck ? `<t:${(g_m.data.lastWorkerCheck/1000).toFixed(0)}:R>` : 'Unknown' }\n`;
          // } else if (string_b.length > 900) {
          //   string_c += `<@${m}> Power: ${power.toFixed(2)}, Last Check: ${g_m.data.lastWorkerCheck ? `<t:${(g_m.data.lastWorkerCheck/1000).toFixed(0)}:R>` : 'Unknown' }\n`;
          // } else if (string.length > 900) {
          //   string_b += `<@${m}> Power: ${power.toFixed(2)}, Last Check: ${g_m.data.lastWorkerCheck ? `<t:${(g_m.data.lastWorkerCheck/1000).toFixed(0)}:R>` : 'Unknown' }\n`;
          // } else {
          //   string += `<@${m}> Power: ${power.toFixed(2)}, Last Check: ${g_m.data.lastWorkerCheck ? `<t:${(g_m.data.lastWorkerCheck/1000).toFixed(0)}:R>` : 'Unknown' }\n`;
          // }
        }
      } else {
        no_workers.push(m);
      }
    } else {
      not_registered.push(m);
    }
  }

  worker_data.sort((a,b) => { return check_top_power(b) - check_top_power(a)});
  worker_data.forEach(w => {
    let g_m = guild_members.find(x => x.user == w.user);
    let power = check_top_power(w);
    if (string_c.length > 900) {
      string_d += `<@${w.user}> Power: ${power.toFixed(2)}, Last Check: ${g_m.data.lastWorkerCheck ? `<t:${(g_m.data.lastWorkerCheck/1000).toFixed(0)}:R>` : 'Unknown' }\n`;
    } else if (string_b.length > 900) {
      string_c += `<@${w.user}> Power: ${power.toFixed(2)}, Last Check: ${g_m.data.lastWorkerCheck ? `<t:${(g_m.data.lastWorkerCheck/1000).toFixed(0)}:R>` : 'Unknown' }\n`;
    } else if (string.length > 900) {
      string_b += `<@${w.user}> Power: ${power.toFixed(2)}, Last Check: ${g_m.data.lastWorkerCheck ? `<t:${(g_m.data.lastWorkerCheck/1000).toFixed(0)}:R>` : 'Unknown' }\n`;
    } else {
      string += `<@${w.user}> Power: ${power.toFixed(2)}, Last Check: ${g_m.data.lastWorkerCheck ? `<t:${(g_m.data.lastWorkerCheck/1000).toFixed(0)}:R>` : 'Unknown' }\n`;
    }
  });


  let met_string = '';
  let met_string2 = '';
  let not_reg_string = '';
  let no_worker_string = '';

  good.forEach(x => {
    if (met_string.length > 900) {
      met_string2 += `<@${x}> `;
    } else {
      met_string += `<@${x}> `;
    }
  });
  not_registered.forEach(x => {
    not_reg_string += `<@${x}> `;
  })
  no_workers.forEach(x => {
    no_worker_string += `<@${x}> `;
  })


  const newEmbed = new Discord.EmbedBuilder()
    .setTitle("Power Requirements Check")
    .setDescription(`Power requirement set by guild is ${guild.power_req}`);

  if (met_string) {
    newEmbed.addFields(
      {
        name:`Met requirements`,
        value:met_string,
      }
    )
  }
  if (met_string2) {
    newEmbed.addFields(
      {
        name:`Met requirements 2`,
        value:met_string2,
      }
    )
  }
  if (string) {
    newEmbed.addFields(
      {
        name:`Has not met requirements`,
        value:string,
      }
    )
  }
  if (string_b) {
    newEmbed.addFields(
      {
        name:`Has not met requirements 2`,
        value:string_b,
      }
    )
  }
  if (string_c) {
    newEmbed.addFields(
      {
        name:`Has not met requirements 3`,
        value:string_c,
      }
    )
  }
  if (string_d) {
    newEmbed.addFields(
      {
        name:`Has not met requirements 4`,
        value:string_d,
      }
    )
  }
  if (no_worker_string) {
    newEmbed.addFields(
      {
        name:`No Workers found`,
        value:no_worker_string,
      }
    )
  }
  if (not_reg_string) {
    newEmbed.addFields(
      {
        name:`Not Registered with EW`,
        value:not_reg_string,
      }
    )
  }

  msg.reply({embeds:[newEmbed]});
}

async function check_life(bot, guild, msg, args) {
  let members = guild.members;

  let guild_members = await User.find({user:{$in:members}}).exec();


  let string = '';
  let string_b = '';
  let string_c = '';
  let good = [];
  let not_registered = [];
  for (let i = 0;i < members.length;i++) {
    let m = members[i];
    let g_m = guild_members.find(x => x.user == m);
    if (g_m) {
      if (g_m.data.farmLife >= guild.farmLife_req) {
        good.push(m);
      } else {
        if (string_b.length > 900) {
          string_c += `<@${m}> Farm life lvl: ${g_m.data.farmLife}\n`;
        } else if (string.length > 900) {
          string_b += `<@${m}> Farm life lvl: ${g_m.data.farmLife}\n`;
        } else {
          string += `<@${m}> Farm life lvl: ${g_m.data.farmLife}\n`;
        }
      }
    } else {
      not_registered.push(m);
    }
  }

  let met_string = '';
  let met_string2 = '';
  let not_reg_string = '';

  good.forEach(x => {
    if (met_string.length > 900) {
      met_string2 += `<@${x}> `;
    } else {
      met_string += `<@${x}> `;
    }
  });
  not_registered.forEach(x => {
    not_reg_string += `<@${x}> `;
  })

  const newEmbed = new Discord.EmbedBuilder()
    .setTitle("Farm life Requirements Check")
    .setDescription(`Farm life upgrade requirement set by guild is ${guild.farmLife_req}`);

  if (met_string) {
    newEmbed.addFields(
      {
        name:`Met requirements`,
        value:met_string,
      }
    )
  }
  if (met_string2) {
    newEmbed.addFields(
      {
        name:`Met requirements 2`,
        value:met_string2,
      }
    )
  }
  if (string) {
    newEmbed.addFields(
      {
        name:`Has not met requirements`,
        value:string,
      }
    )
  }
  if (string_b) {
    newEmbed.addFields(
      {
        name:`Has not met requirements 2`,
        value:string_b,
      }
    )
  }
  if (string_c) {
    newEmbed.addFields(
      {
        name:`Has not met requirements 3`,
        value:string_c,
      }
    )
  }
  if (not_reg_string) {
    newEmbed.addFields(
      {
        name:`Not Registered with EW`,
        value:not_reg_string,
      }
    )
  }

  msg.reply({embeds:[newEmbed]});
}

function check_top_power(worker) {
  let workers = [];
  if (worker.useless) {
    workers.push({
      power:get_power(1, worker.useless),
      type:1,
    })
  }
  if (worker.deficient) {
    workers.push({
      power:get_power(2, worker.deficient),
      type:2,
    })
  }
  if (worker.common) {
    workers.push({
      power:get_power(3, worker.common),
      type:3,
    })
  }
  if (worker.talented) {
    workers.push({
      power:get_power(4, worker.talented),
      type:4,
    })
  }
  if (worker.wise) {
    workers.push({
      power:get_power(5, worker.wise),
      type:5,
    })
  }
  if (worker.expert) {
    workers.push({
      power:get_power(6, worker.expert),
      type:6,
    })
  }
  if (worker.masterful) {
    workers.push({
      power:get_power(7, worker.masterful),
      type:7,
    })
  }

  if (!workers.length) return 0;
  workers.sort((a,b) => { return b.power - a.power});

  if (workers.lengths < 3) {
    let total = 0;
    workers.forEach(x => {
      total += x.power;
    })
    return total;
  } else {
    let total = workers[0].power + workers[1].power + workers[2].power;
    return total;
  }
}

async function delete_data(bot, guild, msg, args) {
  await Guilds.deleteMany({owner:guild.owner}).exec();
  msg.reply({content:`Guild data deleted, Please do \`idle guild list\` to load the new data`});
}

async function power_embed(bot, guild, msg, args) {
  let members = guild.members;

  let guild_members = await User.find({user:{$in:members}}).exec();
  let guild_workers = await Workers.find({user:{$in:members}}).exec();


  let min = 999;
  let max = 0;
  let total = 0;
  let amount = 0;
  let not_registered = [];
  let not_reg_string = '';
  let no_workers = [];
  let no_worker_string = '';
  
  let workers = [];
  for (let i = 0;i < members.length;i++) {
    let m = members[i];
    let g_m = guild_members.find(x => x.user == m);
    if (g_m) {
      let w_m = guild_workers.find(x => x.user == m);
      if (w_m) {
        let power = check_top_power(w_m);
        amount++;
        total += power;
        if (power > max) {
          max = power;
        }
        if (power < min) {
          min = power;
        }
        workers.push({
          user:w_m.user,
          power:power,
        });
      } else {
        no_workers.push(m);
      }
    } else {
      no_workers.push(m);
    }
  }

  workers.sort((a,b) => { return b.power - a.power });

  no_workers.forEach(x => {
    no_worker_string += `<@${x}> `;
  })
  not_registered.forEach(x => {
    not_reg_string += `<@${x}> `;
  })

  const newEmbed = new Discord.EmbedBuilder()
    .setTitle("Guild Power")
    .setDescription(`Power Req: 💥${guild.power_req}\n` +
      `Power Range: 💥${max.toFixed(2)}-💥${min.toFixed(2)}\n` +
      `Power Average: 💥${(total/amount).toFixed(2)}`
    );

  let string = '';
  let number = 1;
  while (workers.length) {
    let p = workers.shift();
    if (string.length > 900) {
      newEmbed.addFields(
        {
          name:`Top Power ${number}`,
          value:string,
        }
      )
      string = '';
      number++;
    }
    string += `💥 **${p.power.toFixed(2)}** - <@${p.user}>\n`;
  }

  if (string) {
    newEmbed.addFields(
      {
        name:`Top Power ${number}`,
        value:string,
      }
    )
  }

  if (no_worker_string) {
    newEmbed.addFields(
      {
        name:`No Worker data known`,
        value:no_worker_string,
      }
    )
  }
  if (not_reg_string) {
    newEmbed.addFields(
      {
        name:`Not Registered with EW`,
        value:not_reg_string,
      }
    )
  }

  msg.reply({embeds:[newEmbed]});

}

function guild_help(bot, guild, msg, args) {
  const newEmbed = new Discord.EmbedBuilder()
    .setTitle('Guild Help')
    .addFields(
      {
        name:"Commmands",
        value:`\`ew guild\` Shows this help command\n` +
        `\`ew guild setpower <Number 0-500>\` Set the power requirement\n` +
        `\`ew guild check\` Check if power requirements have been met\n` +
        `\`ew guild setlife <Number 0-3>\` Set the farm life upgrade requirement\n` +
        `\`ew guild life\` Check if farm life requirements have been met\n` +
        `\`ew guild power\` Check power of your guild members\n` +
        `\`ew guild delete\` Delete outdated guild data\n`
      }
    )
  msg.reply({embeds:[newEmbed]});
}

function get_power (type, level) {
  return (type + 2) * (1 + type/3.25) * (1 + level/1.25);
}

module.exports.help = {
  name: "guild",
  aliases: ["g"]
}