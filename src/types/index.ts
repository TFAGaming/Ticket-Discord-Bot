import { SlashCommandBuilder, ContextMenuCommandBuilder, ChatInputCommandInteraction, SlashCommandSubcommandsOnlyBuilder } from "discord.js";
import ExtendedClient from "../class/ExtendedClient";

export interface ConfigStructure {
    client: {
        token: string,
        id: string
    }
};

export interface Command {
    structure: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">  | ContextMenuCommandBuilder,
    run: (client: ExtendedClient, interaction: ChatInputCommandInteraction) => void
};