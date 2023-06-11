import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, PermissionFlagsBits, time } from "discord.js";
import { client } from "../..";

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const category = client.channels.cache.get(client.db.get('category'));

    if (!category) {
        await interaction.reply({
            content: 'Unable to create a ticket. The category ID of the tickets doesn\'t exist, please contact the server administrators to fix this error.',
            ephemeral: true
        });

        return;
    };

    if (interaction.customId === 'createticket') {
        if (interaction.guild?.channels.cache.find((c) => c.name === 'ticket-' + interaction.user.id)) {
            await interaction.reply({
                content: 'You have created a ticket already.',
                ephemeral: true
            });

            return;
        };

        await interaction.deferReply({ ephemeral: true });

        try {
            const channel = await interaction.guild?.channels.create({
                name: 'ticket-' + interaction.user.id,
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: client.db.get('role'),
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles]
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles]
                    }
                ]
            });

            await channel?.send({
                content: `<@${interaction.user.id}>`,
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Ticket: ticket-' + interaction.user.id)
                        .setDescription('Thanks for creating a ticket! You can contact with the staff members now.')
                        .setColor('Blurple')
                        .setFooter({
                            text: 'To close the ticket, click on the button: 🔒 Close\nOnly staff members can delete the ticket.'
                        })
                ],
                components: [
                    new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('closeticket_' + interaction.user.id)
                                .setEmoji('🔒')
                                .setLabel('Close')
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setCustomId('deleteticket_' + interaction.user.id)
                                .setEmoji('🗑️')
                                .setLabel('Delete')
                                .setStyle(ButtonStyle.Danger),
                        )
                ]
            });

            await interaction.followUp({
                content: `Here is your new ticket: <#${channel?.id}>`
            });
        } catch {
            await interaction.reply({
                content: 'Unable to create a ticket, please contact the server administrators to fix this error.',
                ephemeral: true
            });
        };

        return;
    };

    if (interaction.customId.startsWith('closeticket_')) {
        if (interaction.channel?.type !== ChannelType.GuildText) return;
        if (!interaction.guild?.roles.everyone) return;

        if (interaction.channel.name.startsWith('closed-')) {
            await interaction.reply({
                content: 'This ticket has been already closed.',
                ephemeral: true
            });

            return;
        };

        const split = interaction.customId.split('_').slice(1);

        const user = interaction.guild?.members.cache.get(split[0]);

        await interaction.deferReply({ ephemeral: true });

        await interaction.channel.edit({
            name: 'closed-' + split[0],
            permissionOverwrites: [
                {
                    id: interaction.guild?.roles.everyone,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: client.db.get('role'),
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles]
                },
                {
                    id: interaction.user.id,
                    deny: [PermissionFlagsBits.SendMessages],
                    allow: [PermissionFlagsBits.ViewChannel]
                }
            ]
        });

        await interaction.channel.send({
            content: `<@${interaction.user.id}> has closed the ticket.`
        });

        await interaction.followUp({
            content: 'You have sucessfully closed the ticket.',
            ephemeral: true
        });

        return;
    };

    if (interaction.customId.startsWith('deleteticket_')) {
        if (interaction.channel?.type !== ChannelType.GuildText) return;
        if (!interaction.guild?.roles.everyone) return;

        const split = interaction.customId.split('_').slice(1);

        const user = interaction.guild?.members.cache.get(split[0]);

        const messages = (await interaction.channel.messages.fetch()).filter((e) => e.author.id !== client.user?.id).reverse().map((v) => `[${new Date(v.createdTimestamp).toLocaleString()}] ${v.author.tag}: ${v.content}`).join('\n');

        await interaction.reply({
            content: 'Deleteting the ticket...',
            ephemeral: true
        });

        await interaction.channel.send({
            content: `<@${interaction.user.id}> has deleted the ticket. Deleting the ticket in: ${time(Math.floor((Date.now() / 1000) + 5), 'R')}...`
        });

        setTimeout(async () => {
            await interaction.channel?.delete().catch(() => { });
        }, 5000);

        await user?.send({
            content: 'Your ticket has been deleted by **' + interaction.user.tag + '**.',
            files: [
                new AttachmentBuilder(Buffer.from(`${messages.length > 0 ? messages : '[No messages were fetched]'}`, 'utf-8'), { name: 'message history.txt' })
            ]
        }).catch(() => { });

        return;
    };
});