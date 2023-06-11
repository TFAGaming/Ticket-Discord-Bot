import { client } from "../..";

client.once('ready', () => {
    console.log('Logged in as ' + client.user?.username);
});