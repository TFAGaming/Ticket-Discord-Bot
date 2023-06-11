import { ActionRowBuilder, ChannelType, ModalBuilder, PermissionFlagsBits, SlashCommandBuilder, TextInputBuilder } from "discord.js";
import { client } from "../..";

export default new client.command({
    structure: new SlashCommandBuilder()
        .setName('create')
        .setDescription('Create a new ticket panel.')
        .addSubcommand((o) =>
            o.setName('panel')
                .setDescription('Create a new ticket panel.')
                .addChannelOption((o) => o.setName('channel').setDescription('The channel here the panel should be sent to.').setRequired(true).addChannelTypes(ChannelType.GuildText))
                .addChannelOption((o) => o.setName('category').setDescription('The category where the tickets should be created.').setRequired(true).addChannelTypes(ChannelType.GuildCategory))
                .addRoleOption((o) => o.setName('role').setDescription('The tickets manager role. If empty, a new one will be created automatically.').setRequired(true))
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    run: async (client, interaction) => {

        const channel = interaction.options.getChannel('channel');

        if (!channel) {
            await interaction.reply({
                content: 'Invalid channel provided.',
                ephemeral: true
            });

            return;
        };

        const category = interaction.options.getChannel('category');

        if (!category) {
            await interaction.reply({
                content: 'Invalid channel provided.',
                ephemeral: true
            });

            return;
        };

        const role = interaction.options.getRole('role');

        if (!role) {
            await interaction.reply({
                content: 'Invalid role provided.',
                ephemeral: true
            });

            return;
        };

        await interaction.showModal(
            new ModalBuilder()
                .setTitle(`Ticket Builder`)
                .setCustomId('createpanel_' + channel.id + '_' + category.id + '_' + role?.id)
                .addComponents(
                    new ActionRowBuilder<TextInputBuilder>()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('paneltitle')
                                .setLabel('Panel title:')
                                .setPlaceholder('Create a Ticket')
                                .setRequired(false)
                                .setMaxLength(256)
                                .setStyle(1)
                        ),
                    new ActionRowBuilder<TextInputBuilder>()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('paneldescription')
                                .setLabel('Panel description:')
                                .setPlaceholder('To create a ticket, click on the button below.')
                                .setRequired(false)
                                .setStyle(2)
                        ),
                    new ActionRowBuilder<TextInputBuilder>()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('buttonlabel')
                                .setLabel('Button label:')
                                .setPlaceholder('Create')
                                .setRequired(false)
                                .setMaxLength(25)
                                .setStyle(2)
                        )
                )
        )

    }
});