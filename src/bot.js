const Discord = require('discord.js');
const auth = require('../auth.json');
const arMap = require('../configs/arMap.json');
const UBStorage = require('../configs/UtilityBotStorage');

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
function commandHelp(msg)
{
    let help_msg = "**Howdy! I\'m Utility Bot. Here are my commands:**\n\n" +
        "**!help** = Chill, you already figured this one out.\n" +
        "**!enableAutoResponse [tag]** = Enables auto responses. Only affects the tagged AR if specified.\n" +
        "**!disableAutoResponse [tag]** = Disables auto responses. Only affects the tagged AR if specified\n" +
        "**!random min max** = Generates a random number in the range [min,max).";
    msg.channel.send(help_msg);
}

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

function commandRandom(min, max, msg)
{
    let rand = Math.random();
    let num = Math.floor(rand * Math.floor(max - min)) + Math.floor(min);
    msg.channel.send(num.toString());
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
})

client.on('warn', (info) =>
{
    console.log(info);
})

client.on('typingStart', (channel, user) =>
{
    console.log(user.username + ' started typing');
})

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
        switch (command.type)
        {
            case "help":
                commandHelp(msg);
                return;
            case "enableAutoResponse":
            case "e-ar":
                if (command.args)
                {
                    commandAutoResponse(true, command.args[0]);
                }
                else
                {
                    commandAutoResponse(true);
                }
                sendConfirm(msg.channel);
                return;
            case "disableAutoResponse":
            case "d-ar":
                if (command.args)
                {
                    commandAutoResponse(false, command.args[0]);
                }
                else
                {
                    commandAutoResponse(false);
                }
                sendConfirm(msg.channel);
                return;
            case "random":
                if (command.args && command.args.length == 2)
                {
                    commandRandom(command.args[0], command.args[1], msg);
                }
                else
                {
                    sendError(msg.channel, "!random <start\> <end>");
                }
                return;
            case "addMeme":
                if (command.args && command.args.length == 1)
                {
                    commandAddMeme(command.args[0]);
                }
                else
                {
                    sendError(msg.channel, "!addMeme <meme link>");
                }
                return;
            case "bignut":
                msg.channel.send({
                    files: [{
                        attachment: './assets/bignut.jpg',
                        name: 'bignut.jpg'
                    }]
                });
                break;
        }

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

