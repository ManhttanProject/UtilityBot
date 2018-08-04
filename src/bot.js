const Discord = require('discord.js');
const auth = require('../auth.json');
const arMap = require('../storage/arMap.json');
const UBStorage = require('../storage/UtilityBotStorage');
const commands = require('./commands.js');

const client = new Discord.Client();
const token = auth.token;
client.login(token);

// HELPERS ==================================
function getCommand(msg)
{
    if (msg.content.length > 0 && msg.content.charAt(0) == '!')
    {
        let arr = msg.content.substring(1).split(' ');
        if (arr.length < 2)
        {
            return;
        }
        else if (arr[0] == 'u') // proper command
        {
            console.log('command received, command: ' + arr[1]);
            let command = { type: arr[1], args: arr.slice(2) };
            return command;
        }
    }
}

function getAutoResponse(msg)
{
    const content = msg.content;

    let arProps = Object.getOwnPropertyNames(arMap);

    for (let i = 0; i < arProps.length; ++i)
    {
        let outerKey = arProps[i];

        for (let j = 0; j < arMap[outerKey].keys.length; ++j)
        {
            if (arMap[outerKey].enabled && content.includes(arMap[outerKey].keys[j]))
            {
                let temp =
                {
                    trigger: arMap[outerKey].keys[j],
                    response: arMap[outerKey].response,
                    includeAuthor: arMap[outerKey].includeAuthor
                };
                return temp;
            }
        }

    }
}


// COMMAND HELPERS ===========================
function sendError(channel, usage)
{
    channel.send("usage: " + usage);
}

function sendConfirm(channel)
{
    channel.send("command executed");
}



// COMMANDS ==================================


function commandAutoResponse(enable, tag)
{
    let arProps = Object.getOwnPropertyNames(arMap);
    if (!tag)
    {
        for (let i = 0; i < arProps.length; ++i)
        {
            arMap[arProps[i]].enabled = enable;
        }
    }
    else
    {
        if (arProps.includes(tag))
        {
            arMap[tag].enabled = enable;
        }
    }
}

function commandAddMeme(memeLink)
{
    UBStorage.memes.list.push(memeLink);
}


// EVENTS ====================================
client.on('ready', () =>
{
    console.log('client ready');

    client.channels.keyArray()
});

client.on('error', (err) =>
{
    try
    {
        console.log('error: ' + err.message);
    }
    catch (all)
    {
        console.log('unknown error encountered');
    }
});

client.on('warn', (info) =>
{
    console.log(info);
});

client.on('message', (msg) =>
{
    console.log('message received, contents: ' + msg.content);

    // Prevent bot loops
    if (msg.author.bot)
    {
        return;
    }

    // Check for commands
    let command = getCommand(msg);
    if (command)
    {
        command.type.toLowerCase();
        command.type.trim();

        commands.process(command, msg);
        return;
    }

    // Check for auto response
    let ar = getAutoResponse(msg);
    if (ar)
    {
        if (ar.includeAuthor)
        {
            let author = msg.author.username;
            let firstLine = "\"**" + ar.trigger + "**\" - *" + author + "*";
            msg.channel.send(firstLine + "\n\n" + ar.response);
        }
        else
        {
            msg.channel.send(ar.response);
        }
    }
});

