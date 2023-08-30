require('dotenv').config();
const User = require('../models/user');
const General = require('../modules/general');

const { Events } = require('discord.js');

const prefix = 'ew ';

module.exports = {
  name: Events.MessageUpdate,
  async execute(bot, oldmsg, msg) {
    if (msg.channel.id != "1134062576226013275" && process.env.STATE == "DEVELOPMENT") return;
    if (msg.author.id == "1085406806492319784") idle_handler(bot, msg, oldmsg);
  },
};

async function idle_handler(bot, msg, oldMsg) {
  let embed = msg.embeds[0];
  if (!embed) return;

  let url = embed.data?.author?.icon_url;
  let author = embed.data?.author?.name;
  let id;
  if (url && !url.startsWith('https://cdn.discordapp.com/avatars/')) {
    url = url.slice("https://cdn.discordapp.com/avatars/".length);
    let index = url.indexOf('/');
    id = url.substring(0, index);
  // } else if (author) {
  //   let member = General.get_member_by_username(msg.guild, author, 1);
  //   if (member?.user?.id) {
  //     id = member.user.id;
  //   }
  } else {
    let footer = embed.data?.footer?.text;
    if (footer && footer.startsWith('Owner: ')) {
      bot.idlecommands.get('guild list').run(bot, undefined, msg);
    }
    let descr = embed.data?.description;
    if (!descr) return;
    if (descr.startsWith('This is the **idle market**!')) {
      let command;
      let cmd = 'market';

      if (bot.idlecommands.has(cmd)) {
        command = bot.idlecommands.get(cmd);
      }

      try {
        command.run(bot, {}, msg);
      } catch (e) {
        return;
      }
      return;
    } else {
      return;
    }
  };
  if (!id) return;

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
    command.run(bot, us, msg, oldMsg);
  } catch (e) {
    return;
  }
}