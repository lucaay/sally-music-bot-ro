const {GuildMember} = require('discord.js');

module.exports = {
  name: 'remove',
  description: 'Sterge o melodie din lista!',
  options: [
    {
      name: 'number',
      type: 4, // 'INTEGER' Type
      description: 'Numarul melodiei pe care vrei sa o stergi',
      required: true,
    },
  ],
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
    const number = interaction.options.get('number').value - 1;
    if (number > queue.tracks.length)
      return void interaction.followUp({content: '❌ | Numarul melodiei este mai mare decat numarul melodiilor din lista!'});
    const removedTrack = queue.remove(number);
    return void interaction.followUp({
      content: removedTrack ? `✅ | A fost sters **${removedTrack}**!` : '❌ | Ceva nu a mers bine!',
    });
  },
};
