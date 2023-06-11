import { SlashCommandBuilder } from "discord.js";
import { client } from "../..";

export default new client.command({
    structure: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    run: async (client, interaction) => {
        await interaction.reply({
            content: 'Pong!',
            ephemeral: true
        });
    }
});