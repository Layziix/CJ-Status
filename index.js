const {seeInfo} = require("./Gather-data.js")
// TODO: add a liking system for each discord user => own db ??
// TODO: add a system were only specific users can use commands ?
const {
    Client,
    ActivityType,
    GatewayIntentBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
} = require("discord.js");

// TODO: secure these data
const TOKEN = "MTM2MjE1NDI3ODI1MjMxODkzMw.GM1Nie.7jMUNaMHvSPr7jHplhKNwPIWeQEI4fz2-IiQow";
const ChannelID = "1362160035286876281";
const statusMessageID = "1368718804296663153";
const CJ_DATA_LINK = "http://jukebox.cj/sync"

const MessageCJ = "### __Le CJ est ouvert ! Venez vous détendre__.\n"
//TODO: When releasing, modify these values
const emojis = {
    play: "<:play:1362458688488734761>",
    pause: "<:pause:1362458686986911814>",
    playing: "<:playing:1362458767760822282>",
    skip: "<:skip:1362458689901957181>",
    stop: "<:stop:1362458691307044996>",
    volumeUp: "<:volumeUp:1362458685745402096>",
    volumeDown: "<:volumeDown:1362458684462075954>",
}
const isJukeboxLaunched = true;
const updateTime = 5000;

//TODO: link with the futur backend
/*
/api/user/signup with UserData (username, password) from the cj
/api/user/login with UserData from the cj
/api/player/add_to_queue with id (int32)
/api/player/play
/api/player/pause
/api/player/next
/api/player/set_volume with the number
/api/player/seek with a position number
*/

const formatTime = (n) => n.toString().padStart(2, '0');
const formatPlayingTime = (n) => {
    const hours = Math.floor(n / 3600);
    const minutes = Math.floor(n / 60);
    const seconds = Math.floor(n % 60);

    return hours === 0 ? `${formatTime(minutes)}:${formatTime(seconds)}` : `${formatTime(hours)}:${formatTime(minutes)}`
};

// Client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

// Bot online
client.on("ready", async () => {
    // Starting the bot
    client.user.setPresence({
        status: "online",
        activities: [{name: "Starting up...", type: ActivityType.Custom}]
    });

    const channel = await client.channels.fetch(ChannelID).catch(() => console.log("wrong channel ID"));
    if (!channel || !channel.isTextBased()) return;

    const updateStatusMessage = async (content, embed = null, components = null, file = null) => {
        const options = {content};
        if (embed) options.embeds = [embed];
        if (components) options.components = [components];
        // Initialize bot message if it is not already here

        const statusMessage = await channel.messages.fetch(statusMessageID)
        if (!statusMessage) {
            const statusMessage = await channel.send(options);
        }
        if (file) {options.files = [{attachment: file}]} else {statusMessage.removeAttachments()}
        await statusMessage.edit(options).catch(async (err) => {
            console.warn("Couldn’t edit message", err);
        });
    };

    const updatePresence = (playing = false, music = null) => {
        if (playing && music) {
            client.user.setActivity({
                type: ActivityType.Custom,
                name: "Custom Listening status",
                state: `${emojis.playing} · Listening to ${music.title}`
            });
        } else {
            client.user.setActivity({
                type: ActivityType.Custom,
                name: "Custom Waiting status",
                state: "😎 · Chilling"
            });
        }
    };

    // CJ Open
    if (isJukeboxLaunched) {
            const launchedFun = async (isPlaying, music, currentTime) => {
            // music playing
            if (isPlaying) {
                // TODO: retrieve the current time of the music
                const percentage = currentTime / music.duration;
                const progress = Math.round(10 * percentage);
                const bar = '▬'.repeat(progress) + '⭕' + '-'.repeat(10 - progress);

                const nowPlayingEmbed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle(music.track ?? "Unknown Title")
                    .setAuthor({name: music.artist ?? "Unknown Artist"})
                    .setThumbnail(music.albumart_url ?? "./images/CJ open.jpg")
                    .setDescription(`\`${formatPlayingTime(parseInt(currentTime))}\` ${bar} \`${formatPlayingTime(parseInt(music.duration))}\``);

                const controls = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("down").setEmoji(emojis.volumeDown).setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("pause").setEmoji(emojis.pause).setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("skip").setEmoji(emojis.skip).setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("up").setEmoji(emojis.volumeUp).setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("stop").setEmoji(emojis.stop).setStyle(ButtonStyle.Secondary),
                );

                updatePresence(true, music);
                await updateStatusMessage(`${MessageCJ}`, nowPlayingEmbed, controls);
            } else {
                updatePresence(false);
                // TODO: better custom message when nothing is playing ?
                await updateStatusMessage(`${MessageCJ}### Nothing playing for now.`, null, null, "./images/CJ open.jpg");
                await channel.messages.fetch(statusMessageID).then(message => {
                    message.suppressEmbeds(true)
                    message.components.forEach((control) =>
                        control.setDisabled(true))
                })
            }
        }
        // TODO: change with futur backend
        setInterval(async () => {
            fetch(CJ_DATA_LINK)
                .then(response => {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        return response.json();
                    } else {
                        throw new Error("Not a JSON response");
                    }
                })
                .then(data => {
                    const music = data.playlist[0] || null;
                    const isPlaying = data.playlist.length > 0;
                    launchedFun(isPlaying, music, data.time_pos)
                });
        }, updateTime)
    }

    // CJ Closed
    else {
        client.user.setPresence({status: "offline"});

        await updateStatusMessage(
            "Le CJ est sûrement fermé, mais n'hésites pas à contacter quelqu'un pour l'ouvrir !",
            null,
            null,
            "./images/CJ closed.avif"
        );
    }
})

client.on("interactionCreate", async interaction => {
    const replyAndDelete = async (interaction, content) => {
        const msg = await interaction.reply({content, fetchReply: true});
        setTimeout(() => msg.delete().catch(() => {
        }), updateTime);
    };

    // Help command descriptions
    const helpDescriptions = {
        all: {
            title: "CJ-Status Help Menu (10 commands)",
            description: "Use `/help <command>` to get more info.",
            fields: [
                {
                    name: "Music",
                    value: "`play`, `pause`, `skip`, `stop`, `up`, `down`, `link`, `queue`, `add`",
                    inline: false
                },
                {name: "Bot", value: "`help`", inline: false}
            ]
        },
        play: {title: "Help for /play", description: "Resumes the music when it has been paused previously."},
        pause: {title: "Help for /pause", description: "Pauses the music. Resume with /play."},
        skip: {title: "Help for /skip", description: "Skips the current track to the next one."},
        stop: {title: "Help for /stop", description: "Stops and clears the queue. Use with caution."},
        down: {title: "Help for /down", description: "Decreases the volume by 5%."},
        up: {title: "Help for /up", description: "Increases the volume by 5%."},
        link: {title: "Help for /link", description: "Gives the link of the current music."},
        queue: {title: "Help for /queue", description: "Shows upcoming musics in queue."},
        add: {
            title: "Help for /add",
            description: "Adds a new music to the queue.",
            fields: [{name: "Usage", value: "/add <music_link>", inline: false}]
        }
    };

    // Basic chat responses
    // TODO: change with futur backend
    const chatResponses = {
        up: `🔼 Volume increased by ${interaction.user.username}`,
        down: `🔽 Volume decreased by ${interaction.user.username}`,
        pause: `⏸ Music paused by ${interaction.user.username}`,
        play: `▶️ ${music.title} resumed by ${interaction.user.username}`,
        skip: `⏩ ${music.title} skipped by ${interaction.user.username}`,
        stop: `${interaction.user.username} stopped all musics`,
        queue: seeInfo("queue"),
        link: seeInfo("link"),
    };

    // Slash command handler
    if (interaction.isChatInputCommand()) {
        const {commandName, options} = interaction;

        // ephemeral help commands
        if (commandName === "help") {
            const sub = options.getSubcommand();
            const now = new Date();

            const data = helpDescriptions[sub];
            if (!data) return;

            const helpEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle(data.title)
                .setDescription(data.description || "")
                .setFooter({
                    text: `CJ-Status Bot · ${formatTime(now.getHours())}:${formatTime(now.getMinutes())}`,
                    iconURL: client.user.displayAvatarURL()
                });

            if (data.fields) helpEmbed.addFields(data.fields);

            return interaction.reply({embeds: [helpEmbed], ephemeral: true});
        }

        // TODO: <add> commands backend
        if (chatResponses[commandName]) {
            return replyAndDelete(interaction, chatResponses[commandName]);
        }
    }

    // Button interactions handler
    if (interaction.isButton()) {
        const response = chatResponses[interaction.customId];

        if (response) {
            return replyAndDelete(interaction, response);
        }
    }
});

// Log the Bot
client.login(TOKEN);