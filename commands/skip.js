const {GuildMember} = require('discord.js');

module.exports = {
  name: 'skip',
  description: 'Sari peste o melodie!',
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
    if (!queue || !queue.playing) return void interaction.followUp({content: '❌ | Nu este redata nicio melodie!'});
    const currentTrack = queue.current;
    const success = queue.skip();
    return void interaction.followUp({
      content: success ? `✅ | A fost sarita melodia: **${currentTrack}**!` : '❌ | Ceva nu a mers bine!',
    });
  },
};
