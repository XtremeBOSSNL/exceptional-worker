const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	execute(bot) {
		console.log(`Ready! Logged in as ${bot.user.username}#${bot.user.discriminator}`);
	},
};