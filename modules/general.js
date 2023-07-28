
const Energy = require('../models/energy');
const Claim = require('../models/claim');

const donor_energy = [1,1.1,1.3,1.55];
const upgrade_energy = [1,1.2,1.35,1.5,1.6,1.7,1.75,1.8];

function calc_energy_cooldown (us) {
  let multi = donor_energy[us.data.donorTier] * upgrade_energy[us.data.energyRegenUpgrade];

  let sec = 60 * (6/multi);

  return sec;
}

function calc_energy_cooldown_display (us) {
  let time = calc_energy_cooldown(us);

  let min = 0;
  let sec = 0;

  while(time >= 60) {
    min++;
    time -= 60;
  }

  sec = time.toFixed(0);

  return (min > 0 ? `${min}m ` : '') + (sec > 0 ? `${sec}s` : ''); 
}

async function energy_check (bot) {
  let users = await Energy.find({active:true, energyFull:{ $lt: Date.now() }}).exec();

  console.log(`${users.length} energy reminders ready`);
  for (let i = 0; i<users.length;i++) {
    let channel = await bot.channels.fetch(users[i].channel, {allowUnkownGuild:true, force:true}).catch(err=>console.log(err));
    await channel.send({content:`<@${users[i].user}> You're Energy is full`}).catch(err=>console.log(err)); 
    users[i].active = false;
    users[i].save().catch(err=>console.log(err));
  }
  return;
}

async function claim_check (bot) {
  let users = await Claim.find({active:true, claimReminder:{ $lt: Date.now() }}).exec();

  console.log(`${users.length} claim reminders ready`);
  for (let i = 0; i<users.length;i++) {
    let channel = await bot.channels.fetch(users[i].channel, {allowUnkownGuild:true, force:true}).catch(err=>console.log(err));
    await channel.send({content:`<@${users[i].user}> This is your claim reminder`}).catch(err=>console.log(err)); 
    users[i].active = false;
    users[i].save().catch(err=>console.log(err));
  }
  return;
}

module.exports = {calc_energy_cooldown, calc_energy_cooldown_display, energy_check, claim_check}