const User = require('../models/user');
const Discord = require('discord.js');
const Workers = require('../models/worker');

const worker_data = require('../data/workers.json').workers;


module.exports.run = async (bot, us, msg) => {
    let embed = msg.embeds[0];
    
    let worker = await Workers.findOne({ user:us.user }).exec();
    if (!worker) {
        worker = new Workers({
            user:us.user,
        })
    }

    let field = embed.fields.find(x => x.name.includes('Enemy farms'));
    let value = field.value;
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
            name:"masterful",
            power: get_power(7,worker.masterful).toFixed(2),
            used:false,
        });
    }
    if (worker.expert) {
        attacker.push({
            name:"expert",
            power: get_power(6,worker.expert).toFixed(2),
            used:false,
        });
    }
    if (worker.wise) {
        attacker.push({
            name:"wise",
            power: get_power(5,worker.wise).toFixed(2),
            used:false,
        });
    }
    if (worker.talented) {
        attacker.push({
            name:"talented",
            power: get_power(4,worker.talented).toFixed(2),
            used:false,
        });
    }
    if (worker.common) {
        attacker.push({
            name:"common",
            power: get_power(3,worker.common).toFixed(2),
            used:false,
        });
    }
    if (worker.deficient) {
        attacker.push({
            name:"deficient",
            power: get_power(2,worker.deficient).toFixed(2),
            used:false,
        });
    }
    if (worker.useless) {
        attacker.push({
            name:"useless",
            power: get_power(1,worker.useless).toFixed(2),
            used:false,
        });
    }
     
    attacker.sort((a,b) => b.power - a.power);

    let enemys = get_order(value, enemy);

    // let heart_multiplier = calc_heart_multiplier(value);
    // let battle_ongoing = true;
    // let enemy_number = 0;

    // while (battle_ongoing) {
    //     if (enemy_number >= enemys.length) {
    //         battle_ongoing = false;
    //     } else {
    //         let enemy = enemys[enemy_number];

    //         let target_power = Math.ceil((heart_multiplier*enemy.power)/100);
    //         let perfect_match = attacker.find(x => x.power == target_power && x.used == false);
    //         let higher_match = attacker.find(x => x.power < target_power && x.used == false);
    //         let lower_match = attacker.find(x => x.power > target_power && x.used == false);
    //         if (perfect_match.length) {
    //             attacker_order.push(perfect_match[0].name);
    //             perfect_match.used = true;
    //             enemy.dead = true;
    //             enemy_number++;
    //         } else if (higher_match.length) {
    //             if (lower_match.length) {
    //                 higher_match.sort((a, b) => a.index - b.index);
    //                 lower_match.sort((a, b) => a.index - b.index);
    //                 let lower_total = 0;
    //                 lower_match.forEach(match => {
    //                     lower_total += match.power;
    //                 });
    //                 let enemies_left = enemys.find(x => x.power >= enemy.power && x.dead == false);
    //                 let only_up_enemy = enemys.find(x => x.power >= enemy.power && x.dead == false && ceil((heart_multiplier*x.power)/100) <= higher_match[0].power);
    //                 if (higher_match.length >= enemies_left || only_up_enemy.length == 1 || lower_total < target_power) {
    //                     attacker_order.push(higher_match[0].name);
    //                     higher_match[0].used = true;
    //                     enemy.dead = true;
    //                     enemy_number++;
    //                 } else if (lower_match.length == 2 && lower) {
    //                     attacker_order.push(higher_match[0].name);
    //                     attacker_order.push(lower_match[0].name);
    //                     higher_match[0].used = true;
    //                     lower_match[1].used = true;
    //                     enemy.dead = true;
    //                     enemy_number++;
    //                 }
    //             } else {
    //                 higher_match.sort((a, b) => a.index - b.index);
    //                 attacker_order.push(higher_match[0].name);
    //                 higher_match[0].used = true;
    //                 enemy.dead = true;
    //                 enemy_number++;
    //             }
    //         } else if (lower_match.length) {

    //         } else {
    //             battle_ongoing = false;
    //         }
    //     }
    // }


    let string = "";

    for (let i = 0; i < Math.max(enemys.length, attacker.length);i++) {
      let a = attacker[i];
      let d = enemys[i];
      
      if (a?.name) {
        string += `${worker_data[a.name].emoji} ${a.power > 9 ? a.power : `0${a.power}`} 💥 `;
      } else {
        string += `⬛ 00.00 💥 `;
      }

      if (d?.name) {
        string += `${worker_data[d.name].emoji} ${d.power > 9 ? d.power : `0${d.power}`} :shield:`;
      } else {
        string += `⬛ 00.00 :shield:`;
      }
      string += '\n';
    }

    const newEmbed = new Discord.EmbedBuilder()
      .addFields(
        {
            name:`Attacker/Defender`,
            value:string,
            inline:true,
        },
      )
      .setFooter({text:'Warning: Deficient L3 7, Talented L3 7, Wise L1, Masterful L2 Potentially bugged mirrormatch'});

    msg.reply({embeds:[newEmbed]});
}

function calc_heart_multiplier (value) {
    let string = /\s`(\d+)\/(\d+)/g.exec(value)?.[1] || 100;
    return string/100;
}

function get_order (value, enemy) {
    let array = [];
    let heart_multiplier = calc_heart_multiplier(value);
    if (enemy.useless) {
      array.push({
        name:"useless",
        index:value.indexOf("<a:uselessworker:1084589589437620475>"),
        power:(get_power(1,enemy.useless)*heart_multiplier).toFixed(2),
        dead:false,
      })
    }
    if (enemy.deficient) {
      array.push({
        name:"deficient",
        index:value.indexOf("<a:deficientworker:1084586320996876371>"),
        power:(get_power(2,enemy.deficient)*heart_multiplier).toFixed(2),
        dead:false,
      })
    }
    if (enemy.common) {
      array.push({
        name:"common",
        index:value.indexOf("<a:commonworker:1084577922305757276>"),
        power:(get_power(3,enemy.common)*heart_multiplier).toFixed(2),
        dead:false,
      })
    }
    if (enemy.talented) {
      array.push({
        name:"talented",
        index:value.indexOf("<a:talentedworker:1084589586589679739>"),
        power:(get_power(4,enemy.talented)*heart_multiplier).toFixed(2),
        dead:false,
      })
    }
    if (enemy.wise) {
      array.push({
        name:"wise",
        index:value.indexOf("<a:wiseworker:1084589591195037876>"),
        power:(get_power(5,enemy.wise)*heart_multiplier).toFixed(2),
        dead:false,
      })
    }
    if (enemy.expert) {
      array.push({
        name:"expert",
        index:value.indexOf("<a:expertworker:1084589584438005842>"),
        power:(get_power(6,enemy.expert)*heart_multiplier).toFixed(2),
        dead:false,
      })
    }
    if (enemy.masterful) {
      array.push({
        name:"masterful",
        index:value.indexOf("<a:masterfulworker:1084589585671139508>"),
        power:(get_power(7,enemy.masterful)*heart_multiplier).toFixed(2),
        dead:false,
      })
    }
    array.sort((a, b) => a.index - b.index);
  
    return array;
  }


function get_power(type, level) {
  return (type + 2) * (1 + type/4) * (1 + level/2.5);
}

module.exports.help = {
  name: "raid",
  aliases: []
}



