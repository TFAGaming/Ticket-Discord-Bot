import { ActivityType, Client, Collection, REST, Routes } from "discord.js";
import { Command, ConfigStructure } from "../types";
import { readdirSync, readFileSync } from 'node:fs';
import { load } from 'js-yaml';
import { JSONMap } from "tfa-jsonmap";

export default class extends Client {
    public commands: Collection<string, Command> = new Collection();
    public commandsArray: Command['structure'][] = [];
    public config: ConfigStructure = load(readFileSync('./config.yaml', 'utf-8')) as ConfigStructure;
    public db: JSONMap<any> = new JSONMap('./JSON/db.json', { prettier: true });

    constructor() {
        super({
            intents: [
                'Guilds'
            ],
            presence: {
                activities: [{
                    name: 'tickets!',
                    type: ActivityType.Watching
                }]
            }
        });
    };

    public loadModules() {
        for (const dir of readdirSync('./dist/commands/')) {
            for (const file of readdirSync('./dist/commands/' + dir)) {
                const module: Command = require('../commands/' + dir + '/' + file).default;

                this.commands.set(module.structure.name, module);
                this.commandsArray.push(module.structure);

                console.log('Loaded new command: ' + file);
            };
        };

        for (const dir of readdirSync('./dist/events/')) {
            for (const file of readdirSync('./dist/events/' + dir)) {
                require('../events/' + dir + '/' + file);

                console.log('Loaded new event: ' + file);
            };
        };
    };

    public command = class {
        public structure: Command['structure'];
        public run: Command['run'];

        constructor(data: Command) {
            this.structure = data.structure;
            this.run = data.run;
        };
    };

    public async deploy() {
        const rest = new REST().setToken(this.config.client.token ?? '');

        try {
            console.log('Started loading app commands...');

            await rest.put(Routes.applicationCommands(this.config.client.id ?? ''), {
                body: this.commandsArray
            });

            console.log('Finished loading app commands.');
        } catch (e) {
            console.error(e);
        };
    };

    public async start() {
        await this.login(this.config.client.token);
    };
};