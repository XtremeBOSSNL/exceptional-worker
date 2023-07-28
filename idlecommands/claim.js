const User = require('../models/user');
const Discord = require('discord.js');
const Energy = require('../models/energy');
const General = require('../modules/general');
const Claim = require('../models/claim');

module.exports.run = async (bot, us, msg) => {
    if (us.settings.claimReminder == false) return; 
    us.data.lastClaim = Date.now();
    us.save().catch(err=>console.log(err));

    let hours = us.data.lastClaimHours;
    if (!hours) return;

    let claim = await Claim.findOne({ user:us.user }).exec();
    if (!claim) {
        claim = new Claim({
            user:us.user,
            claimReminder:0,
            active:false,
        })
    }

    let timestamp = Date.now() + (1000*60*60*hours);
    claim.claimReminder = timestamp;
    claim.active = true;
    claim.channel = msg.channel.id;
    claim.save().catch(err=>console.log(err));
    msg.react('<:CheckMark:1011588182149697556>');
}

module.exports.help = {
  name: "claim",
  aliases: []
}