const {GuildMember} = require('discord.js');
const {QueryType} = require('discord-player');

module.exports = {
  name: 'play',
  description: 'Reda o melodie in canalul tau!',
  options: [
    {
      name: 'query',
      type: 3, // 'STRING' Type
      description: 'Melodia pe care vrei sa o redai',
      required: true,
    },
  ],
  async execute(interaction, player) {
    try {
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

      const query = interaction.options.get('query').value;
      const searchResult = await player
        .search(query, {
          requestedBy: interaction.user,
          searchEngine: QueryType.AUTO,
        })
        .catch(() => {});
      if (!searchResult || !searchResult.tracks.length)
        return void interaction.followUp({content: 'Melodia nu a fost gasita!'});

      const queue = await player.createQueue(interaction.guild, {
        ytdlOptions: {
				quality: "highest",
				filter: "audioonly",
				highWaterMark: 1 << 25,
				dlChunkSize: 0,
			},
        metadata: interaction.channel,
      });

      try {
        if (!queue.connection) await queue.connect(interaction.member.voice.channel);
      } catch {
        void player.deleteQueue(interaction.guildId);
        return void interaction.followUp({
          content: 'Nu m-am putut conecta la canalul tau de voce.!',
        });
      }

      await interaction.followUp({
        content: `⏱ | Se incarca ${searchResult.playlist ? 'playlistul' : 'melodia'}...`,
        
      }).then(msg => {
        msg.delete({ timeout: 10000 })
      });
      searchResult.playlist ? queue.addTracks(searchResult.tracks) : queue.addTrack(searchResult.tracks[0]);
      if (!queue.playing) await queue.play();
    } catch (error) {
      console.log(error);
      interaction.followUp({
        content: 'A aparut o eroare la executarea acestei comenzi: ' + error.message,
      });
    }
  },
};
