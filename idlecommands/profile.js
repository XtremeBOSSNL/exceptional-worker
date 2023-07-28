const User = require('../models/user');
const Discord = require('discord.js');
const Energy = require('../models/energy');
const General = require('../modules/general');

module.exports.run = async (bot, us, msg) => {
    let embed = msg.embeds[0];

    if (us.settings.energyReminder == false) return; 

    let energy = await Energy.findOne({ user:us.user }).exec();
    if (!energy) {
        energy = new Energy({
            user:us.user,
            energyFull:1,
            active:false,
        })
    }

    let energy_field = embed.fields.find(x => x.name == 'Energy');

    let energy_value = energy_field.value;
    energy_value = energy_value.slice('<:energy:1084593332312887396> '.length);

    let index = energy_value.indexOf('/');
    let index2 = energy_value.indexOf('\n');
    let current = energy_value.substring(0, index);
    let max = energy_value.substring(index+1, index2)
    
    if (current == max) {
        if (energy.active) {
            energy.active == false;
            energy.save().catch(err=>console.log(err));
        }
    } else {
        let diff = max - current;
        let cooldown = General.calc_energy_cooldown(us);
        let time = parseInt(diff * cooldown);
        let timestamp = Date.now() + (time * 1000);
        energy.energyFull = timestamp;
        energy.active = true;
        energy.channel = msg.channel.id;
        energy.save().catch(err=>console.log(err));
        msg.react('<:CheckMark:1011588182149697556>');
    }
}

module.exports.help = {
  name: "profile",
  aliases: []
}