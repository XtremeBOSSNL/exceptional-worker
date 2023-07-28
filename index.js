const fs = require('node:fs');
const path = require('node:path');
const cron = require('node-cron');
require('dotenv').config();

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const { Client, Collection, GatewayIntentBits, User } = require('discord.js');

const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages] });

const General = require('./modules/general');

bot.commands = new Collection();
bot.aliases = new Collection();
bot.idlecommands = new Collection();

fs.readdir("./commands/", (err, files) =>{
  if(err) console.log(err);

  let jsfile = files.filter(f => f.split(".").pop() === "js");
  if(jsfile.length <= 0){
    return console.log("No commands found!");
  }

  jsfile.forEach((f) => {
    let props = require(`./commands/${f}`);
    console.log(`${f} loaded!`);
    bot.commands.set(props.help.name, props);

    props.help.aliases.forEach(alias => {
      bot.aliases.set(alias, props.help.name);
    })
  })
})

fs.readdir("./idlecommands/", (err, files) =>{
  if(err) console.log(err);

  let jsfile = files.filter(f => f.split(".").pop() === "js");
  if(jsfile.length <= 0){
    return console.log("No commands found!");
  }

  jsfile.forEach((f) => {
    let props = require(`./idlecommands/${f}`);
    console.log(`idlecommand ${f} loaded!`);
    bot.idlecommands.set(props.help.name, props);
  })
})

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  bot.on(event.name, (...args) => event.execute(bot, ...args))
}

if (process.env.STATE == "PRODUCTION") {
  cron.schedule('* * * * *', async () => General.energy_check(bot));
  cron.schedule('* * * * *', async () => General.claim_check(bot));
}

bot.login(process.env.BOT_TOKEN);