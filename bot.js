const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.login(process.env.DISCORD_BOT_TOKEN);

module.exports = async function createTicket(user, cart) {
  const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);

  const channel = await guild.channels.create({
    name: `order-${user.username}`,
    type: 0,
    parent: process.env.DISCORD_TICKET_CATEGORY_ID
  });

  channel.send(`
New Order!

User: ${user.username}
Money: ${cart.money}M
Spawners: ${cart.skelly}
  `);
};