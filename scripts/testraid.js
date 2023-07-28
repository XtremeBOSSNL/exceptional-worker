let value = '<:sand:1085703918358626364> desert | <a:expertworker:1084589584438005842> Lv1 | ❤️ `105/100`\n' +
'<:sand:1085703918358626364> desert | <a:wiseworker:1084589591195037876> Lv4 | ❤️ `100/100`\n' +
'<:sand:1085703918358626364> desert | <a:talentedworker:1084589586589679739> Lv5 | ❤️ `100/100`\n' +
'<:sand:1085703918358626364> desert | <a:commonworker:1084577922305757276> Lv7 | ❤️ `100/100`\n' +
'<:sand:1085703918358626364> desert | <a:deficientworker:1084586320996876371> Lv6 | ❤️ `100/100`\n' +
'<:sand:1085703918358626364> desert | <a:uselessworker:1084589589437620475> Lv2 | ❤️ `100/100`';

const worker_data = require('../data/workers.json').workers;

let enemy = {
    useless: parseInt(/<a:uselessworker:1084589589437620475>\sLv(\d+)\s\|/g.exec(value)?.[1] || 0),
    deficient: parseInt(/<a:deficientworker:1084586320996876371>\sLv(\d+)\s\|/g.exec(value)?.[1] || 0),
    common: parseInt(/<a:commonworker:1084577922305757276>\sLv(\d+)\s\|/g.exec(value)?.[1] || 0),
    talented: parseInt(/<a:talentedworker:1084589586589679739>\sLv(\d+)\s\|/g.exec(value)?.[1] || 0),
    wise: parseInt(/<a:wiseworker:1084589591195037876>\sLv(\d+)\s\|/g.exec(value)?.[1] || 0),
    expert: parseInt(/<a:expertworker:1084589584438005842>\sLv(\d+)\s\|/g.exec(value)?.[1] || 0),
    masterful: parseInt(/<a:masterfulworker:1084589585671139508>\sLv(\d+)\s\|/g.exec(value)?.[1] || 0),
}

console.log(enemy);


function get_order (value, enemy) {
  let array = [];
  if (enemy.useless) {
    array.push({
      name:"useless",
      index:value.indexOf("<a:uselessworker:1084589589437620475>"),
      power:worker_data.useless.power[enemy.useless],
    })
  }
  if (enemy.deficient) {
    array.push({
      name:"deficient",
      index:value.indexOf("<a:deficientworker:1084586320996876371>"),
      power:worker_data.deficient.power[enemy.deficient],
    })
  }
  if (enemy.common) {
    array.push({
      name:"common",
      index:value.indexOf("<a:commonworker:1084577922305757276>"),
      power:worker_data.common.power[enemy.common],
    })
  }
  if (enemy.talented) {
    array.push({
      name:"talented",
      index:value.indexOf("<a:talentedworker:1084589586589679739>"),
      power:worker_data.talented.power[enemy.talented],
    })
  }
  if (enemy.wise) {
    array.push({
      name:"wise",
      index:value.indexOf("<a:wiseworker:1084589591195037876>"),
      power:worker_data.wise.power[enemy.wise],
    })
  }
  if (enemy.expert) {
    array.push({
      name:"expert",
      index:value.indexOf("<a:expertworker:1084589584438005842>"),
      power:worker_data.expert.power[enemy.expert],
    })
  }
  if (enemy.masterful) {
    array.push({
      name:"masterful",
      index:value.indexOf("<a:masterfulworker:1084589585671139508>"),
      power:worker_data.masterful.power[enemy.masterful],
    })
  }
  array.sort((a, b) => a.index - b.index);

  console.log(array);
}


function heart_multiplier (value) {
    let string = /\s`(\d+)\/(\d+)/g.exec(value)?.[1] || 100;
    return string;
}


//get_order(value, enemy);

heart_multiplier(value);