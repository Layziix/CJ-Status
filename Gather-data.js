const {EmbedBuilder} = require("discord.js");
const CJ_DATA_LINK = "http://jukebox.cj/sync"

const seeInfo = async (info) => {
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
            switch (info) {
                case "queue":
                    const queueEmbed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle("Showing the queue");

                    data.playlist.map((play, index) => {
                        queueEmbed.addFields({name: `${index}. ${play.title}`, value: `${play.artist} (${play.user})`})
                    })
                    break;
                case "link":
                    data.url
                    break;
            }
        });
}

module.exports = {seeInfo};

