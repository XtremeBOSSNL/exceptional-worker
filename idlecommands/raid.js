const User = require('../models/user');
const Discord = require('discord.js');
const Workers = require('../models/worker');
const { RaidSolver } = require('../modules/raid');
const RaidSolutions = require('../models/raidSolution');
const General = require('../modules/general');

const worker_data = require('../data/workers.json').workers;

const type_to_name = ['None','useless','deficient','common','talented','wise','expert','masterful'];
const type_to_letter = ['?','U','D','C','T','W','E','M'];

module.exports.run = async (bot, us, msg) => {
    let embed = msg.embeds[0];

    let teamraid = /farms!\s\(-80\s<:energy:1084593332312887396>\)$/g.exec(embed.description)?.index || 0;
    if (teamraid > 0) return team_raid(bot, us, msg);
    
    let worker = await Workers.findOne({ user:us.user }).exec();
    if (!worker) {
        worker = new Workers({
            user:us.user,
        })
    }

    let field = embed.fields.find(x => x.name.includes('Enemy farms'));
    let value = field.value;
    let farmlife = /\s`(\d+)\/(\d+)/g.exec(value)?.[1] || 100;
    let enemy = {
        useless: parseInt(/<a:uselessworker:1084589589437620475>\sLv(\d+)\s\|/g.exec(value)?.[1] || 0),
        deficient: parseInt(/<a:deficientworker:1084586320996876371>\sLv(\d+)\s\|/g.exec(value)?.[1] || 0),
        common: parseInt(/<a:commonworker:1084577922305757276>\sLv(\d+)\s\|/g.exec(value)?.[1] || 0),
        talented: parseInt(/<a:talentedworker:1084589586589679739>\sLv(\d+)\s\|/g.exec(value)?.[1] || 0),
        wise: parseInt(/<a:wiseworker:1084589591195037876>\sLv(\d+)\s\|/g.exec(value)?.[1] || 0),
        expert: parseInt(/<a:expertworker:1084589584438005842>\sLv(\d+)\s\|/g.exec(value)?.[1] || 0),
        masterful: parseInt(/<a:masterfulworker:1084589585671139508>\sLv(\d+)\s\|/g.exec(value)?.[1] || 0),
    }

    //let attacker_order = [];
    let attacker = [];
    if (worker.masterful) {
        attacker.push({
            type:7,
            level: worker.masterful,
            power:get_power(7, worker.masterful),
        });
    }
    if (worker.expert) {
        attacker.push({
          type:6,
          level: worker.expert,
          power:get_power(6, worker.expert),
        });
    }
    if (worker.wise) {
        attacker.push({
          type:5,
          level: worker.wise,
          power:get_power(5, worker.wise),
        });
    }
    if (worker.talented) {
        attacker.push({
          type:4,
          level: worker.talented,
          power:get_power(4, worker.talented),
        });
    }
    if (worker.common) {
        attacker.push({
          type:3,
          level: worker.common,
          power:get_power(3, worker.common),
        });
    }
    if (worker.deficient) {
        attacker.push({
          type:2,
          level: worker.deficient,
          power:get_power(2, worker.deficient),
        });
    }
    if (worker.useless) {
        attacker.push({
          type:1,
          level: worker.useless,
          power:get_power(1, worker.useless),
        });
    }

    let enemys = get_order(value, enemy);
    if (!enemys.length) return msg.reply({content:`No enemies found. if this is not only empty farms please report this with a screenshot\nhttps://discord.gg/Ksw8YaPhjF`});

    attacker = max_6_attackers(attacker);
    let enemyString = get_worker_string(enemys);
    let attackerString = get_worker_string(attacker);

    let solution = await RaidSolutions.findOne(
      {
        enemyString:enemyString,
        attackerString:attackerString,
        farmlife:farmlife,
      }
      ).exec();
    if (!solution) {
      const raidSolver = new RaidSolver(attacker,enemys,farmlife);
      let stats = raidSolver.runAllSims();
      solution = new RaidSolutions({
        enemyString: enemyString,
        attackerString: attackerString,
        farmlife: farmlife,
        best_score: stats[0],
        best_solution: stats[1],
        best_hp_left: stats[2],
        stats: stats[3],
      });
      solution.save().catch(err=>console.log(err));
    }

    if (us.settings.raidSimpleMode) {
      let string = "";
      for (let i = 0;i < solution.best_solution.length;i++) {
        string += `${us.settings.raidWorkerEmoji ? worker_data[type_to_name[solution.best_solution[i].type]].emoji : type_to_letter[solution.best_solution[i].type] } `;
      }
      const newEmbed = new Discord.EmbedBuilder()
        .setDescription(`This solution clears ${solution.best_score} farms ${solution.best_hp_left ? `with the next at ${solution.best_hp_left}hp left` : ''}\n` + string)
        .setFooter({text:'Empty farms are not included in the cleared farm count'});
      msg.reply({embeds:[newEmbed]});
    } else {
      let string = "";

      for (let i = 0; i < Math.max(enemys.length, solution.best_solution.length);i++) {
        let a = solution.best_solution[i];
        let d = enemys[i];
        
        if (a?.type) {
          let power = get_power(a.type, a.level).toFixed(2);
          string += `${us.settings.raidWorkerEmoji ? worker_data[type_to_name[a.type]].emoji : type_to_letter[a.type]} ${power > 9 ? power : `0${power}`} 💥 `;
        } else {
          string += `⬛ 00.00 💥 `;
        }

        if (d?.type) {
          let power = get_power(d.type, d.level).toFixed(2);
          string += `${us.settings.raidWorkerEmoji ? worker_data[type_to_name[d.type]].emoji : type_to_letter[d.type]} ${power > 9 ? power : `0${power}`} :shield:`;
        } else {
          string += `⬛ 00.00 :shield:`;
        }
        string += '\n';
      }

      const newEmbed = new Discord.EmbedBuilder()
        .setDescription(`This solution clears ${solution.best_score} farms ${solution.best_hp_left ? `with the next at ${solution.best_hp_left}hp left` : ''}`)
        .addFields(
          {
              name:`Attacker/Defender`,
              value:string,
              inline:true,
          },
        )
        .setFooter({text:'Empty farms are not included in the cleared farm count'});

      msg.reply({embeds:[newEmbed]});
  }
}

function get_worker_string(workers) {
  let string = '';
  for(let i = 0;i < workers.length;i++) {
    string += `${workers[i].type}:${workers[i].level};`;
  }
  return string;
}

function get_power (type, level) {
  return (type + 2) * (1 + type/4) * (1 + level/2.5);
}

function get_order (value, enemy) {
    let array = [];
    if (enemy.useless) {
      array.push({
        type:1,
        level:enemy.useless,
        index:value.indexOf("<a:uselessworker:1084589589437620475>"),
      })
    }
    if (enemy.deficient) {
      array.push({
        type:2,
        level:enemy.deficient,
        index:value.indexOf("<a:deficientworker:1084586320996876371>"),
      })
    }
    if (enemy.common) {
      array.push({
        type:3,
        level:enemy.common,
        index:value.indexOf("<a:commonworker:1084577922305757276>"),
      })
    }
    if (enemy.talented) {
      array.push({
        type:4,
        level:enemy.talented,
        index:value.indexOf("<a:talentedworker:1084589586589679739>"),
      })
    }
    if (enemy.wise) {
      array.push({
        type:5,
        level:enemy.wise,
        index:value.indexOf("<a:wiseworker:1084589591195037876>"),
      })
    }
    if (enemy.expert) {
      array.push({
        type:6,
        level:enemy.expert,
        index:value.indexOf("<a:expertworker:1084589584438005842>"),
      })
    }
    if (enemy.masterful) {
      array.push({
        type:7,
        level:enemy.masterful,
        index:value.indexOf("<a:masterfulworker:1084589585671139508>"),
      })
    }
    array.sort((a, b) => a.index - b.index);
  
    return array;
  }

async function team_raid(bot, us, msg) {
  let embed = msg.embeds[0];

  let enemyOrder = [];
  for (let i = 0; i < embed.fields.length;i++) {
    let field = embed.fields[i];

    let farmlife = /\s`(\d+)\/(\d+)/g.exec(field.value)?.[2] || 100;
    let enemy = {
        useless: parseInt(/<a:uselessworker:1084589589437620475>\sLv(\d+)\s\|/g.exec(field.value)?.[1] || 0),
        deficient: parseInt(/<a:deficientworker:1084586320996876371>\sLv(\d+)\s\|/g.exec(field.value)?.[1] || 0),
        common: parseInt(/<a:commonworker:1084577922305757276>\sLv(\d+)\s\|/g.exec(field.value)?.[1] || 0),
        talented: parseInt(/<a:talentedworker:1084589586589679739>\sLv(\d+)\s\|/g.exec(field.value)?.[1] || 0),
        wise: parseInt(/<a:wiseworker:1084589591195037876>\sLv(\d+)\s\|/g.exec(field.value)?.[1] || 0),
        expert: parseInt(/<a:expertworker:1084589584438005842>\sLv(\d+)\s\|/g.exec(field.value)?.[1] || 0),
        masterful: parseInt(/<a:masterfulworker:1084589585671139508>\sLv(\d+)\s\|/g.exec(field.value)?.[1] || 0),
    }

    let order = get_min_order(field.value, enemy, farmlife);
    enemyOrder = enemyOrder.concat(order);
  }

  let players = [];
  players.push(us.user);
  for(let i = 1; i < msg.components.length;i++) {
    let row = msg.components[i];
    let name = row.components[0].data.label;
    let u = await General.get_member_by_username(msg.guild, name);
    if (u?.user?.id) {
      players.push(u.user.id);
    } else {
      players.push(`Couldnt find ${name}`);
    }
  }

  let workers = await Workers.find({user:{$in:players}}).exec();

  let atk_string = [];
  for(let i = 0; i < msg.components.length;i++) {
    let row = msg.components[i];
    let user = players[i];
    let work = workers.find(x => x.user == user);
    let string = '';
    for (let j = 0;j < row.components.length;j++) {
      let but = row.components[j];
      let atk =  /^(\w+)worker_/g.exec(but.data.custom_id)?.[1] || "??";
      if (work) {
        string += `${worker_data[atk].emoji || "??"} 💥 ${get_power(worker_data[atk].type,work[atk]).toFixed(2)}\n`;
      } else {
        string += `${worker_data[atk].emoji || "??"} No Worker Data\n`;
      }
    }
    atk_string.push(string);
  }

  let enemyString = '';
  for (let i = 0; i < enemyOrder.length;i++) {
    let e = enemyOrder[i];
    enemyString += `${worker_data[type_to_name[e.type]].emoji} :shield: ${e.powerReq.toFixed(3)}\n`;
  }

  const newEmbed = new Discord.EmbedBuilder()
    .setTitle(`Teamraid helper`)
    .addFields(
      {
        name:`Enemy Farms (Power to one shot)`,
        value:enemyString,
      }
    )

  for (let i = 0;i < players.length;i++) {
    newEmbed.addFields({
      name:msg.components[i].components[0].data.label || players[i],
      value:atk_string[i] || "???",
      inline:true,
    });
  }

  msg.reply({embeds:[newEmbed]});
}


function get_min_order (value, enemy, farmLife) {
  let array = [];
  if (enemy.useless) {
    array.push({
      type:1,
      level:enemy.useless,
      powerReq:minimal_kill_power(1, enemy.useless, farmLife),
      index:value.indexOf("<a:uselessworker:1084589589437620475>"),
    })
  }
  if (enemy.deficient) {
    array.push({
      type:2,
      level:enemy.deficient,
      powerReq:minimal_kill_power(2, enemy.deficient, farmLife),
      index:value.indexOf("<a:deficientworker:1084586320996876371>"),
    })
  }
  if (enemy.common) {
    array.push({
      type:3,
      level:enemy.common,
      powerReq:minimal_kill_power(3, enemy.common, farmLife),
      index:value.indexOf("<a:commonworker:1084577922305757276>"),
    })
  }
  if (enemy.talented) {
    array.push({
      type:4,
      level:enemy.talented,
      powerReq:minimal_kill_power(4, enemy.talented, farmLife),
      index:value.indexOf("<a:talentedworker:1084589586589679739>"),
    })
  }
  if (enemy.wise) {
    array.push({
      type:5,
      level:enemy.wise,
      powerReq:minimal_kill_power(5, enemy.wise, farmLife),
      index:value.indexOf("<a:wiseworker:1084589591195037876>"),
    })
  }
  if (enemy.expert) {
    array.push({
      type:6,
      level:enemy.expert,
      powerReq:minimal_kill_power(6, enemy.expert, farmLife),
      index:value.indexOf("<a:expertworker:1084589584438005842>"),
    })
  }
  if (enemy.masterful) {
    array.push({
      type:7,
      level:enemy.masterful,
      powerReq:minimal_kill_power(7, enemy.masterful, farmLife),
      index:value.indexOf("<a:masterfulworker:1084589585671139508>"),
    })
  }
  array.sort((a, b) => a.index - b.index);

  return array;
}

function minimal_kill_power (type, level, life) {
  let power = get_power(type, level);
  let dmg = life-0.49;
  let needed_power = (dmg * power) / 100;
  return needed_power;
}

function max_6_attackers (attackers) {
  attackers.sort((a,b) => { return b.power - a.power; });
  while (attackers.length >= 7) {
    attackers.pop();
  }
  return attackers;
}

module.exports.help = {
  name: "raid",
  aliases: []
}



