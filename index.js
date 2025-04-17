const TOKEN = "MTM2MjE1NDI3ODI1MjMxODkzMw.GDfJkR.UdiIne2XS9VvCkgUMaBFrTuYcVxl-z058S5xwk";
const ChannelID = "1362160035286876281";
const {
    Client,
    ActivityType,
    GatewayIntentBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
} = require("discord.js");
const MessageCJ = "# __Le CJ est ouvert ! Venez vous détendre__.\n### Now playing:"

function formatTime(number) {
    return number.toString().padStart(2, '0');
}

//TODO: link with the existing jukebox app later
//TODO : remove later (only here for test)
const music = {
    title: "music name",
    artist: "music artist",
    thumbnail: "https://i1.sndcdn.com/artworks-000300305496-o4ettj-t500x500.jpg",
    duration: 134,
}
const isPlaying = true;

// Client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

// Custom message offline

// Bot online
client.on("ready", () => {
    console.log(`${client.user.tag} ready!`);

    client.user.setPresence({
        status: "online",
        activities: [{name: "Starting up...", type: ActivityType.Custom}]
    });

    //TODO: clear previous offline message
    setInterval(() => {
        if (isPlaying) {
            // TODO: update dynamically this
            const currentTime = 99;
            const progressBarLength = 10;

            const percentage = currentTime / music.duration;
            const progress = Math.round(progressBarLength * percentage);
            const bar = '🟧'.repeat(progress) + '🟥' + '⬜'.repeat(progressBarLength - progress);

            const formatPlayingTime = (sec) => {
                const m = Math.floor(sec / 60).toString().padStart(2, '0');
                const s = (sec % 60).toString().padStart(2, '0');
                return `${m}:${s}`;
            };
            const channel = client.channels.cache.get(ChannelID);

            client.user.setActivity({
                type: ActivityType.Custom,
                name: "Custom Listening status",
                // TODO: change to a better custom emoji from the server
                state: "🎵 · Listening to " + music.title
            });

            if (channel && channel.isTextBased()) {
                const nowPlayingEmbed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle(music.title)
                    .setAuthor({name: music.artist})
                    .setThumbnail(music.thumbnail)
                    .setDescription(`\`${formatPlayingTime(currentTime)}\` ${bar} \`${formatPlayingTime(music.duration)}\``)

                //TODO: custom emojis here too
                const controls = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("down")
                        .setEmoji("🔽")
                        .setStyle(ButtonStyle.Secondary),
                    //TODO: change in play when pause is pressed
                    new ButtonBuilder()
                        .setCustomId("pause")
                        .setEmoji("⏸")
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId("skip")
                        .setEmoji("⏩")
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId("up")
                        .setEmoji("🔼")
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId("stop")
                        .setEmoji("⏹")
                        .setStyle(ButtonStyle.Danger),
                );

                //TODO: instead of sending, edit the message when needed
                channel.send({embeds: [nowPlayingEmbed], components: [controls], content: MessageCJ})
                    .then(botMsg => {
                        setTimeout(() => botMsg.delete(), 5000);
                    });
            }
        } else {
            client.user.setActivity({
                type: ActivityType.Custom,
                name: "Custom Waiting status",
                // TODO: change to a better custom emoji from the server
                state: "😎 Chilling"
            })
        }
    }, 5000)
})


client.on("interactionCreate", async interaction => {
    // When seeing messages for slash commands
    if (interaction.isChatInputCommand()) {
        const command = interaction.commandName;

        switch (command) {
            case "help":
                const subCommand = interaction.options.getSubcommand();
                const time = new Date();
                const helpEmbed = new EmbedBuilder().setColor(0xFF0000).setFooter({
                    text: `CJ-Status Bot · ${formatTime(time.getHours())}:${formatTime(time.getMinutes())}`,
                    iconURL: client.user.displayAvatarURL()
                });

                switch (subCommand) {
                    default:
                        helpEmbed
                            .setTitle("CJ-Status Help Menu (10 commands)")
                            .setDescription("Use `/help <command>` to get more info.")
                            .addFields(
                                {
                                    name: "Music",
                                    value: "`play`, `pause`, `skip`, `stop`, `up`, `down`, `link`, `queue`, `add`",
                                    inline: false
                                },
                                {name: "Bot", value: "`help`", inline: false}
                            )

                        await interaction.reply({embeds: [helpEmbed], ephemeral: true});
                        break;
                    case "play":
                        helpEmbed
                            .setTitle(`CJ-Status Help Menu > ${subCommand}`)
                            .setDescription("Resumes the music when it has been paused previously.")
                            .setFooter({
                                text: `CJ-Status Bot · ${formatTime(time.getHours())}:${formatTime(time.getMinutes())}`,
                                iconURL: client.user.displayAvatarURL()
                            });

                        await interaction.reply({embeds: [helpEmbed], ephemeral: true});
                        break;
                    case "pause":
                        helpEmbed
                            .setTitle(`CJ-Status Help Menu for /${subCommand}`)
                            .setDescription("Pauses the music for an undetermined period of time. Can be resumed with /play.")

                        await interaction.reply({embeds: [helpEmbed], ephemeral: true});
                        break;
                    case "skip":
                        helpEmbed
                            .setTitle(`CJ-Status Help Menu for /${subCommand}`)
                            .setDescription("Skips the current track to play the next one.")

                        await interaction.reply({embeds: [helpEmbed], ephemeral: true});
                        break;
                    case "stop":
                        helpEmbed
                            .setTitle(`CJ-Status Help Menu for /${subCommand}`)
                            .setDescription("Completely stops all the musics, thus clearing the queue. Careful when using it.")

                        await interaction.reply({embeds: [helpEmbed], ephemeral: true});
                        break;
                    case "down":
                        helpEmbed
                            .setTitle(`CJ-Status Help Menu for /${subCommand}`)
                            .setDescription("Decreases the volume of the jukebox by 5%.")

                        await interaction.reply({embeds: [helpEmbed], ephemeral: true});
                        break;
                    case "up":
                        helpEmbed
                            .setTitle(`CJ-Status Help Menu for /${subCommand}`)
                            .setDescription("Increases the volume of the jukebox by 5%.")

                        await interaction.reply({embeds: [helpEmbed], ephemeral: true});
                        break;
                    case "link":
                        helpEmbed
                            .setTitle(`CJ-Status Help Menu for /${subCommand}`)
                            .setDescription("Gives you the link where the music is coming from.")

                        await interaction.reply({embeds: [helpEmbed], ephemeral: true});
                        break;
                    case "queue":
                        helpEmbed
                            .setTitle(`CJ-Status Help Menu for /${subCommand}`)
                            .setDescription("Shows the next musics waiting in the queue to be played.")

                        await interaction.reply({embeds: [helpEmbed], ephemeral: true});
                        break;
                    case "add":
                        helpEmbed
                            .setTitle(`CJ-Status Help Menu for /${subCommand}`)
                            .setDescription("Adds a new music to the queue.")
                            .addFields({ name: "Usage", value: "/add <music_link>", inline: false })

                        await interaction.reply({embeds: [helpEmbed], ephemeral: true});
                        break;
                }
                break;
            case "up":
                await interaction
                    .reply({content: `🔼 Volume increased by ${interaction.user.username}`})
                    .then(botMsg => {
                        setTimeout(() => botMsg.delete(), 5000);
                    });
                break;
            case "pause":
                await interaction
                    .reply({content: `⏸ Music paused by ${interaction.user.username}`})
                    .then(botMsg => {
                        setTimeout(() => botMsg.delete(), 5000);
                    });
                break;
            case "play":
                await interaction
                    .reply({content: `▶️ ${music.title} resumed by ${interaction.user.username}`})
                    .then(botMsg => {
                        setTimeout(() => botMsg.delete(), 5000);
                    });
                break;
            case "skip":
                await interaction
                    .reply({content: `⏩ ${music.title} skipped by ${interaction.user.username}`})
                    .then(botMsg => {
                        setTimeout(() => botMsg.delete(), 5000);
                    });
                break;
            case "stop":
                await interaction
                    .reply({content: "⏹ Stopped playing musics"})
                    .then(botMsg => {
                        setTimeout(() => botMsg.delete(), 5000);
                    });
                break;
            case "down":
                await interaction
                    .reply({content: `🔽 Volume decreased by ${interaction.user.username}`})
                    .then(botMsg => {
                        setTimeout(() => botMsg.delete(), 5000);
                    });
                break;
        }
    }

    // Interactions pressed by the user under the bot playing message
    if (interaction.isButton()) {
        switch (interaction.customId) {
            case "up":
                await interaction
                    .reply({content: `🔼 Volume increased by ${interaction.user.username}`})
                    .then(botMsg => {
                        setTimeout(() => botMsg.delete(), 5000);
                    });
                break;
            case "pause":
                await interaction
                    .reply({content: `⏸ Music paused by ${interaction.user.username}`})
                    .then(botMsg => {
                        setTimeout(() => botMsg.delete(), 5000);
                    });
                break;
            case "play":
                await interaction
                    .reply({content: `▶️ ${music.title} resumed by ${interaction.user.username}`})
                    .then(botMsg => {
                        setTimeout(() => botMsg.delete(), 5000);
                    });
                break;
            case "skip":
                await interaction
                    .reply({content: `⏩ ${music.title} skipped by ${interaction.user.username}`})
                    .then(botMsg => {
                        setTimeout(() => botMsg.delete(), 5000);
                    });
                break;
            case "stop":
                await interaction
                    .reply({content: "⏹ Stopped playing musics"})
                    .then(botMsg => {
                        setTimeout(() => botMsg.delete(), 5000);
                    });
                break;
            case "down":
                await interaction
                    .reply({content: `🔽 Volume decreased by ${interaction.user.username}`})
                    .then(botMsg => {
                        setTimeout(() => botMsg.delete(), 5000);
                    });
                break;
        }
    }
});


/*
    case
        "play"
    :
        await interaction.reply({content: "▶️ Now playing...", ephemeral: true});
        break;
    case
        "pause"
    :
        await interaction.reply({content: "⏸ Paused", ephemeral: true});
        break;
    case
        "skip"
    :
        await interaction.reply({content: "⏩ Skipping...", ephemeral: true});
        break;
    case
        "stop"
    :
        await interaction.reply({content: "⏹ Stopping...", ephemeral: true});
        break;
    case
        "up"
    :
        await interaction.reply({content: `🔊 Volume increased by <@${user.id}>`, ephemeral: true});
        break;
    case
        "down"
    :
        await interaction.reply({content: `🔉 Volume decreased by <@${user.id}>`, ephemeral: true});
        break;
    case
        "link"
    :
        await interaction.reply({
            content: "🎵 This music comes from [SoundCloud](https://soundcloud.com/)",
            ephemeral: true
        });
        break;
    case
        "queue"
    :
        await interaction.reply({
            content: "📜 Here’s the current queue:\n1. Track A\n2. Track B\n3. Track C",
            ephemeral: true
        });
        break;
    case
        "add"
    :
        await interaction.reply({
            content: "Adding a music"
        });
        break;
    }
}

*/
// Log the Bot
client.login(TOKEN);