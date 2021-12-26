const fs = require('fs');
const Discord = require('discord.js');
const Client = require('./client/client');
const config = require('./config.json');
const {Player} = require('discord-player');

const client = new Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

console.log(client.commands);

const player = new Player(client);

player.on('error', (queue, error) => {
    console.log(`[${queue.guild.name}] Erroare emisa de lista de redare: ${error.message}`);
});

player.on('connectionError', (queue, error) => {
    console.log(`[${queue.guild.name}] Erroare emisa de conexiune: ${error.message}`);
    
});

player.on('trackStart', (queue, track) => {
  queue.metadata.send(`▶ | A inceput redarea pentru: **${track.title}** in **${queue.connection.channel.name}**!`)
    .then(msg => {
        setTimeout(() => msg.delete(), 5000);
    });
});

player.on('trackAdd', (queue, track) => {
    queue.metadata.send(`🎶 | Melodia **${track.title}** a fost adaugata in lista de redare!`)
    .then(msg => {
        setTimeout(() => msg.delete(), 5000);
    });
});

player.on('botDisconnect', queue => {
    queue.metadata.send('❌ | Am fost deconectat manual de la canalul de voce. Voi sterge toata lista de redare!')
    .then(msg => {
        setTimeout(() => msg.delete(), 5000);
    });
});

player.on('channelEmpty', queue => {
    queue.metadata.send('❌ | Iar m-ati lasat singura... O sa ies si eu...')
    .then(msg => {
        setTimeout(() => msg.delete(), 5000);
    });
});

player.on('queueEnd', queue => {
    queue.metadata.send('✅ | Lista de redare terminata!')
    .then(msg => {
        setTimeout(() => msg.delete(), 5000);
    });
});

client.once('ready', async () => {
    console.log('Ready!');
});

client.on('ready', function() {
    client.user.setActivity(config.activity, { type: config.activityType });
});

client.once('reconnecting', () => {
    console.log('Reconnecting!');
});

client.once('disconnect', () => {
    console.log('Disconnect!');
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;
    if (!client.application?.owner) await client.application?.fetch();

    if (message.content === '!deploy' && message.author.id === client.application?.owner?.id) {
        await message.guild.commands
            .set(client.commands)
            .then(() => {
                message.reply('Deployed!')
                .then(msg => {
                    setTimeout(() => msg.delete(), 5000);
                });

            })
            .catch(err => {
                message.reply('Could not deploy commands! Make sure the bot has the application.commands permission!');
                console.error(err);
            });
    }
});

client.on('interactionCreate', async interaction => {
    const command = client.commands.get(interaction.commandName.toLowerCase());

    try {
        if (interaction.commandName == 'ban' || interaction.commandName == 'userinfo') {
            command.execute(interaction, client);
        } else {
            command.execute(interaction, player);
        }
    }   catch (error) {
        console.error(error);
        interaction.followUp({
            content: 'A aparut o eroare in executarea acestei comenzi!',
        });
    }
});

client.login(config.token);
