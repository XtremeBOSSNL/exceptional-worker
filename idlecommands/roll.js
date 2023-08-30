const User = require('../models/user');
const Discord = require('discord.js');
const Energy = require('../models/energy');
const General = require('../modules/general');
const Hire = require('../models/hire');

module.exports.run = async (bot, us, msg, oldMsg) => {
    let embed = msg.embeds[0];

    if (us.settings.trackHire == false) return;

    let hire = await Hire.findOne({ user:us.user }).exec();
    if (!hire) {
        hire = new Hire({
            user:us.user,
        })
    }

    let fields = embed.fields;
    let name = fields[0].name;

    if (oldMsg) {
        let footer = embed?.footer?.text;
        let oldfooter = oldMsg.embeds[0]?.footer?.text;
        if (!footer || !oldfooter) return;
        let energy = /Energy:\s(\d+)\/(\d+)/g.exec(footer)?.[1];
        let oldenergy = /Energy:\s(\d+)\/(\d+)/g.exec(oldfooter)?.[1];
        if (energy === oldenergy) return;
    };
    
    let roll = {
        useless: /<a:uselessworker:1084589589437620475>/g.exec(name) ? 1 : 0,
        deficient: /<a:deficientworker:1084586320996876371>/g.exec(name) ? 1 : 0,
        common: /<a:commonworker:1084577922305757276>/g.exec(name) ? 1 : 0,
        talented: /<a:talentedworker:1084589586589679739>/g.exec(name) ? 1 : 0,
        wise: /<a:wiseworker:1084589591195037876>/g.exec(name) ? 1 : 0,
        expert: /<a:expertworker:1084589584438005842>/g.exec(name) ? 1 : 0,
        masterful: /<a:masterfulworker:1084589585671139508>/g.exec(name) ? 1 : 0,
    }

    hire.total++;
    hire.useless += roll.useless;
    hire.deficient += roll.deficient;
    hire.common += roll.common;
    hire.talented += roll.talented;
    hire.wise += roll.wise;
    hire.expert += roll.expert;
    hire.masterful += roll.masterful;
    hire.save().catch(err=>console.log(err));
}

module.exports.help = {
  name: "worker roll",
  aliases: []
}