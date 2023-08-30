require('dotenv').config();
const User = require('../models/user');
const General = require('../modules/general');

const { Events } = require('discord.js');

const prefix = 'ew ';

module.exports = {
  name: Events.MessageCreate,
  async execute(bot, msg) {
    if (msg.channel.id != "1134062576226013275" && process.env.STATE == "DEVELOPMENT") return;
    if (msg.author.id == "1085406806492319784") idle_handler(bot, msg);

    if (msg.content.toLocaleLowerCase().startsWith(prefix)) {
      let args = msg.content.slice(prefix.length).trim().split(/ +/g);
      let cmd = args.shift().toLowerCase();
      let command;

      if (bot.commands.has(cmd)) {
        command = bot.commands.get(cmd);
      } else if (bot.aliases.has(cmd)) {
        command = bot.commands.get(bot.aliases.get(cmd));
      }

      try {
        command.run(bot, msg, args);
      } catch (e) {
        return;
      }
    }
  },
};

async function idle_handler(bot, msg) {
  let embed = msg.embeds[0];
  if (!embed) return;

  let url = embed.data?.author?.icon_url;
  let author = embed.data?.author?.name;
  let id;
  if (url && url.startsWith('https://cdn.discordapp.com/avatars/')) {
    url = url.slice("https://cdn.discordapp.com/avatars/".length);
    let index = url.indexOf('/');
    id = url.substring(0, index);
  } else if (author) {
    let name = /^(\w+)\s—\s/g.exec(author)?.[1] || undefined;
    if (name) {
      let member = General.get_member_by_username(msg.guild, author, 1);
      if (member?.user?.id) {
        id = member.user.id;
      }
    }
  }
  if (!id) return;

  let us = await User.findOne({ user: id }).exec();
  if (!us) return;

  let name = embed.data?.author?.name;

  let n_index = name.indexOf(" — ");

  let cmd = name.slice(n_index+" — ".length);

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