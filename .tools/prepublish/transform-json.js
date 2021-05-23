#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yargs = require('yargs');

const a = yargs
    .command(
        '$0',
        'json to transform',
        yargs => {
            yargs.positional('_', {
                describe: 'path to json file',
                type: 'string',
            });
        },
        argv => {
            fs.readFile(argv._[0], (err, data) => {
                if (err) throw err;
                const jsonObject = JSON.parse(data);
                if (!(jsonObject._transform instanceof Object)) {
                    return;
                }
                const newObject = {...jsonObject, ...jsonObject._transform};
                delete newObject._transform;
                console.log(newObject);

                const writePath = path.join(
                    process.cwd(),
                    argv.o,
                    argv._[0].split('/').slice(-1)[0],
                );
                console.log(writePath);

                fs.mkdir(path.join(process.cwd(), argv.o), {recursive: true}, err => {
                    if (err) throw err;
                });
                fs.writeFile(writePath, JSON.stringify(newObject, null, 4), err => {
                    if (err) throw err;
                    console.log(writePath + ' created!');
                });
            });
        },
    )
    .option('outputPath', {
        alias: 'o',
        type: 'string',
        description: 'Run with verbose logging',
        default: `dist/`,
    }).argv;

console.log(a);
