import ExtendedClient from "./class/ExtendedClient";

export const client = new ExtendedClient();

client.loadModules();
client.start();
client.deploy();

process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);