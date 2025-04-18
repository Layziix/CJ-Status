const {retrieveData, seeInfo} = require("./Gather-data.js")
// TODO: add a liking system for each discord user => own db ?
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

const MessageCJ = "# __Le CJ est ouvert ! Venez vous détendre__.\n"
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
const isLaunched = true;
const updateTime = 5000;

//TODO: link with the existing jukebox app later ("backend")
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
    const seconds = Math.floor(n / 60);

    return hours === 0 ? `${formatTime(minutes)}:${formatTime(seconds)}` : `${formatTime(hours)}:${formatTime(minutes)}`
};
let statusMessage;

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
    console.log(`${client.user.tag} ready!`);
    client.user.setPresence({
        status: "online",
        activities: [{name: "Starting up...", type: ActivityType.Custom}]
    });

    const channel = await client.channels.fetch(ChannelID).catch(() => null);
    if (!channel || !channel.isTextBased()) return;

    const updateStatusMessage = async (content, embed = null, components = null, file = null) => {
        const options = {content};
        if (embed) options.embeds = [embed];
        if (components) options.components = [components];
        if (file) options.files = [{attachment: file}];

        if (!statusMessage) {
            statusMessage = await channel.send(options);
        } else {
            await statusMessage.edit(options).catch(async (err) => {
                console.warn("Couldn’t edit message, resending...", err);
                statusMessage = await channel.send(options);
            });
        }
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
    if (isLaunched) {
        const launchedFun = async (isPlaying, music) => {
            // music playing
            if (isPlaying) {
                const currentTime = 99;
                const percentage = currentTime / music.duration;
                const progress = Math.round(10 * percentage);
                const bar = '▬'.repeat(progress) + '⭕' + '-'.repeat(10 - progress);

                const nowPlayingEmbed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle(music.title)
                    .setAuthor({name: music.artist})
                    .setThumbnail(music.albumart_url)
                    .setDescription(`\`${formatPlayingTime(currentTime)}\` ${bar} \`${formatPlayingTime(music.duration)}\``);

                const controls = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("down").setEmoji(emojis.volumeDown).setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("pause").setEmoji(emojis.pause).setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("skip").setEmoji(emojis.skip).setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("up").setEmoji(emojis.volumeUp).setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("stop").setEmoji(emojis.stop).setStyle(ButtonStyle.Secondary),
                );

                updatePresence(true, music);
                await updateStatusMessage(`${MessageCJ}### Now playing:`, nowPlayingEmbed, controls);
            } else {
                updatePresence(false);
                await updateStatusMessage(`${MessageCJ}### Nothing playing for now.`, null, null, "CJ open.jpg");
            }
        }
        setInterval(retrieveData(launchedFun), updateTime)
    }

    // CJ Closed
    else {
        client.user.setPresence({status: "offline"});

        await updateStatusMessage(
            "Le CJ est sûrement fermé, mais n'hésites pas à contacter quelqu'un pour l'ouvrir !\nLe CJ hein... pas toi... fin je sais pas mais t'as compris.",
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

    // Basic cat responses
    // TODO: backend
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