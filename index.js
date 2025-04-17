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
const PREFIX = "!!"
const MessageCJ = "Le CJ est ouvert ! Venez vous détendre."

function formatTime(number) {
    return number < 10 ? '0' + number : number;
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
                const controlsRow1 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("prev")
                        .setEmoji("⏪")
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId("pause")
                        .setEmoji("⏸")
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId("skip")
                        .setEmoji("⏩")
                        .setStyle(ButtonStyle.Secondary),
                );

                const controlsRow2 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("down")
                        .setEmoji("🔽")
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId("stop")
                        .setEmoji("⏹")
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId("up")
                        .setEmoji("🔼")
                        .setStyle(ButtonStyle.Secondary),
                )

                //TODO: instead of sending, edit the message when needed
                channel.send({embeds: [nowPlayingEmbed], components: [controlsRow1, controlsRow2]}).then(botMsg => {
                    setTimeout(() => botMsg.delete().catch((e) => {
                        console.log(e)
                    }), 5000);
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

// Interactions pressed by the user under the bot playing message
client.on("interactionCreate", async interaction => {
    if (!interaction.isButton()) return;

    switch (interaction.customId) {
        case "up":
            await interaction.reply({content: "🔼 Increased volume", flags: MessageFlags.Ephemeral})
            break;
        case "prev":
            await interaction.reply({ content: "⏪ Previous track", flags: MessageFlags.Ephemeral});
            break;
        case "pause":
            await interaction.reply({ content: "⏸ Paused", flags: MessageFlags.Ephemeral});
            break;
        case "skip":
            await interaction.reply({ content: "⏩ Skipped", flags: MessageFlags.Ephemeral});
            break;
        case "stop":
            await interaction.reply({ content: "⏹ Stopped playback", flags: MessageFlags.Ephemeral});
            break;
        case "down":
            await interaction.reply({ content: "🔽 Decreased volume", flags: MessageFlags.Ephemeral});
            break;
    }
});

// When seeing messages for commands
client.on("messageCreate", (message) => {
    // TODO: check only messages in ChannelID
    if (message.content.startsWith(PREFIX)) {
        const input = message.content.slice(PREFIX.length).trim().split(" ");
        const command = input.shift();

        switch (command.toUpperCase()) {
            // TODO: add messages to the other command
            case "HELP":
                if (input.length === 0) {
                    let time = new Date();
                    const helpEmbed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle("CJ-Status Help Menu (9 commands)")
                        .setDescription("Do " + PREFIX + "help <\command> to show more information about it.")
                        .addFields(
                            {
                                name: "Music",
                                value: "`PLAY`, `PAUSE`, `SKIP`, `STOP`, `UP`, `DOWN`, `LINK`, `QUEUE`",
                                inline: false
                            },
                            {name: "Bot", value: "`HELP`", inline: false}
                        )
                        .setFooter({
                            text: "CJ-Status Bot · " + formatTime(time.getHours()) + ":" + formatTime(time.getMinutes()),
                            iconURL: client.user.displayAvatarURL()
                        });


                    message.channel.send({embeds: [helpEmbed]}).then(botMsg => {
                        setTimeout(() => botMsg.delete().catch(() => {
                        }), 15000);
                        setTimeout(() => message.delete().catch(() => {
                        }), 100);
                    });
                    break;
                } else {
                    const commandInfo = input.shift();
                    switch (commandInfo.toUpperCase()) {
                        case "PLAY":
                            break;
                        case "PAUSE":
                            break;
                        case "SKIP":
                            break;
                        case "STOP":
                            break;
                        case "UP":
                            break;
                        case "DOWN":
                            break;
                        case "LINK":
                            break;
                        case "QUEUE":
                            break;
                    }
                    break;
                }
            case "SKIP":
                message.channel.send("Skipping...").then(botMsg => {
                    setTimeout(() => botMsg.delete().catch(() => {
                    }), 10000);
                    setTimeout(() => message.delete().catch(() => {
                    }), 100);
                });
                break;
            case "PLAY":
                message.channel.send("Now playing...").then(botMsg => {
                    setTimeout(() => botMsg.delete().catch(() => {
                    }), 10000);
                    setTimeout(() => message.delete().catch(() => {
                    }), 100);
                });
                break;
            case "PAUSE":
                message.channel.send("Pausing...").then(botMsg => {
                    setTimeout(() => botMsg.delete().catch(() => {
                    }), 10000);
                    setTimeout(() => message.delete().catch(() => {
                    }), 100);
                });
                break;
            case "STOP":
                message.channel.send("Stopping...").then(botMsg => {
                    setTimeout(() => botMsg.delete().catch(() => {
                    }), 10000);
                    setTimeout(() => message.delete().catch(() => {
                    }), 100);
                });
                break;
            case "UP":
                message.channel.send("Volume increased by").then(botMsg => {
                    setTimeout(() => botMsg.delete().catch(() => {
                    }), 2000);
                    setTimeout(() => message.delete().catch(() => {
                    }), 100);
                });
                break;
            case "DOWN":
                message.channel.send("Volume decreased by").then(botMsg => {
                    setTimeout(() => botMsg.delete().catch(() => {
                    }), 2000);
                    setTimeout(() => message.delete().catch(() => {
                    }), 100);
                });
                break;
            case "LINK":
                message.channel.send("This music comes from").then(botMsg => {
                    setTimeout(() => botMsg.delete().catch(() => {
                    }), 10000);
                    setTimeout(() => message.delete().catch(() => {
                    }), 100);
                });
                break;
            case "QUEUE":
                message.channel.send("These are the next musics").then(botMsg => {
                    setTimeout(() => botMsg.delete().catch(() => {
                    }), 10000);
                    setTimeout(() => message.delete().catch(() => {
                    }), 100);
                });
                break;
            default:
                message.channel.send("Command does not exist").then(botMsg => {
                    setTimeout(() => botMsg.delete().catch(() => {
                    }), 10000);
                    setTimeout(() => message.delete().catch(() => {
                    }), 100);
                });
                break;
        }
    }
})

// Log the Bot
client.login(TOKEN);