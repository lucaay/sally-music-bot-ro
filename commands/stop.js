const {GuildMember} = require('discord.js');

module.exports = {
  name: 'stop',
  description: 'Opreste toate melodiile din lista de redare!',
  async execute(interaction, player) {
    if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel) {
      return void interaction.reply({
        content: 'Nu esti intr-un canal de voice!',
        ephemeral: true,
      });
    }

    if (
      interaction.guild.me.voice.channelId &&
      interaction.member.voice.channelId !== interaction.guild.me.voice.channelId
    ) {
      return void interaction.reply({
        content: 'Nu esti in canalul meu de voice!',
        ephemeral: true,
      });
    }

    await interaction.deferReply();
    const queue = player.getQueue(interaction.guildId);
    if (!queue || !queue.playing)
      return void interaction.followUp({
        content: '❌ | Nu este redata nicio melodie!',
      });
    queue.destroy();
    return void interaction.followUp({content: '🛑 | Sally a fost oprit!'});
  },
};
