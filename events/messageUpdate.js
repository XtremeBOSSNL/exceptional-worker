require('dotenv').config();
const User = require('../models/user');

const { Events } = require('discord.js');

const prefix = 'ew ';

module.exports = {
  name: Events.MessageUpdate,
  async execute(bot, oldmsg, msg) {
    if (msg.channel.id != "1134062576226013275" && process.env.STATE == "DEVELOPMENT") return;
    if (msg.author.id == "1085406806492319784") idle_handler(bot, msg);
  },
};






async function idle_handler(bot, msg) {
  let embed = msg.embeds[0];
  if (!embed) return;

  let url = embed.data?.author?.icon_url;
  if (!url) {
    let footer = embed.data?.footer?.text;
    if (footer && footer.startsWith('Owner: ')) {
      bot.idlecommands.get('guild list').run(bot, undefined, msg);
    }
    return;
  };
  if (url && !url.startsWith('https://cdn.discordapp.com/avatars/')) return;
  url = url.slice("https://cdn.discordapp.com/avatars/".length);
  let index = url.indexOf('/');
  let id = url.substring(0, index);

  let us = await User.findOne({ user: id }).exec();
  if (!us) return;

  let name = embed.data?.author?.name;

  let n_index = name.indexOf(" — ");

  let cmd = name.slice(n_index+" — ".length);
  if (cmd != 'worker roll') return;

  let command;

  if (bot.idlecommands.has(cmd)) {
    command = bot.idlecommands.get(cmd);
  }

  try {
    command.run(bot, us, msg);
  } catch (e) {
    return;
  }
}