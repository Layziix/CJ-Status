const { REST, Routes, SlashCommandBuilder } = require("discord.js");
const TOKEN = "MTM2MjE1NDI3ODI1MjMxODkzMw.GDfJkR.UdiIne2XS9VvCkgUMaBFrTuYcVxl-z058S5xwk";
const CLIENT_ID = "1362154278252318933";
const GUILD_ID = "1362155963066482758"; // testing only

const commands = [
    new SlashCommandBuilder()
        .setName("help")
        .setDescription("Displays help info")
        .addSubcommand( sub =>
            sub.setName("play").setDescription("Get help about /play")
        )
        .addSubcommand( sub =>
            sub.setName("pause").setDescription("Get help about /pause")
        )
        .addSubcommand( sub =>
            sub.setName("skip").setDescription("Get help about /skip")
        )
        .addSubcommand( sub =>
            sub.setName("stop").setDescription("Get help about /stop")
        )
        .addSubcommand( sub =>
            sub.setName("up").setDescription("Get help about /up")
        )
        .addSubcommand( sub =>
            sub.setName("down").setDescription("Get help about /down")
        )
        .addSubcommand( sub =>
            sub.setName("link").setDescription("Get help about /link")
        )
        .addSubcommand( sub =>
            sub.setName("queue").setDescription("Get help about /queue")
        )
        .addSubcommand( sub =>
            sub.setName("add").setDescription("Get help about /add")
        ),
    new SlashCommandBuilder().setName("play").setDescription("Play music"),
    new SlashCommandBuilder().setName("pause").setDescription("Pause music"),
    new SlashCommandBuilder().setName("skip").setDescription("Skip track"),
    new SlashCommandBuilder().setName("stop").setDescription("Stop music"),
    new SlashCommandBuilder().setName("up").setDescription("Volume up"),
    new SlashCommandBuilder().setName("down").setDescription("Volume down"),
    new SlashCommandBuilder().setName("link").setDescription("Show source link"),
    new SlashCommandBuilder().setName("queue").setDescription("Show queue"),
    new SlashCommandBuilder()
        .setName("add")
        .setDescription("Add music to the queue")
        .addSubcommand(sub =>
            sub
                .setName("musiclink")
                .setDescription("Add music to the queue using a link")
                .addStringOption(option =>
                    option
                        .setName("link")
                        .setDescription("The music link to add")
                        .setRequired(true)
                )
        )
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
    try {
        console.log("Registering slash commands...");
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
        console.log("Commands registered.");
    } catch (e) {
        console.error(e);
    }
})();
