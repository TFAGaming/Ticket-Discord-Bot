import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder } from "discord.js";
import { client } from "../..";

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId.startsWith('createpanel_')) {
        const split = interaction.customId.split('_').slice(1) || [];

        const channel = client.channels.cache.get(split[0]);
        const category = client.channels.cache.get(split[1]);
        const role = interaction.guild?.roles.cache.get(split[2]);

        if (channel?.type !== ChannelType.GuildText) {
            await interaction.reply({
                content: 'The channel is not type of **Text Channel**.',
                ephemeral: true
            });

            return;
        };

        if (category?.type !== ChannelType.GuildCategory) {
            await interaction.reply({
                content: 'The category is not type of **Category Channel**.',
                ephemeral: true
            });

            return;
        };

        await interaction.deferReply({ ephemeral: true });

        try {
            await channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(interaction.fields.getTextInputValue('paneltitle') || 'Create a Ticket')
                        .setDescription(interaction.fields.getTextInputValue('paneldescription') || 'To create a ticket, click on the button below.')
                        .setColor('Blurple')
                ],
                components: [
                    new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            interaction.fields.getTextInputValue('buttonlabel').length > 0
                                ? new ButtonBuilder()
                                    .setCustomId('createticket')
                                    .setEmoji('🎟️')
                                    .setLabel(interaction.fields.getTextInputValue('buttonlabel') || 'Create')
                                    .setStyle(ButtonStyle.Secondary)
                                : new ButtonBuilder()
                                    .setCustomId('createticket')
                                    .setEmoji('🎟️')
                                    .setStyle(ButtonStyle.Secondary)
                        )
                ]
            });

            client.db.set('category', category.id);
            client.db.set('role', role?.id)

            await interaction.followUp({
                content: 'Successfully created the ticket panel! Everything should be ready now.'
            });
        } catch {
            await interaction.followUp({
                content: 'Unable to create the panel. Please make sure that you haven\'t provided any empty field that contains a space.'
            });
        };
    };
});