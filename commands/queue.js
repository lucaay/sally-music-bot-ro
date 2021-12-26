const {GuildMember} = require('discord.js');

module.exports = {

    name: 'queue',
    description: 'Vezi lista curenta de melodii!',

    async execute (interaction, player) {

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
          var queue = player.getQueue(interaction.guildId);
          if (typeof(queue) != 'undefined') {
            trimString = (str, max) => ((str.length > max) ? `${str.slice(0, max - 3)}...` : str);
              return void interaction.reply({
                embeds: [
                  {
                    title: 'Now Playing',
                    description: trimString(`Melodia curenta este 🎶 | **${queue.current.title}**! \n 🎶 | **${queue}**! `, 4095),
                  }
                ]
              })
          } else {
            return void interaction.reply({
              content: 'Nu este nicio melodie in lista!'
            })
          }
    }
}
