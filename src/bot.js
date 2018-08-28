const filesystem = require('fs');

const Discord = require('discord.js');
const auth = require('../auth.json');
const arMap = require('../storage/arMap.json');
const photoMap = require('../storage/photoMap.json');
const voiceMap = require('../storage/voiceMap.json');
const UBStorage = require('../storage/UtilityBotStorage.json');

const client = new Discord.Client();
const token = auth.token;
client.login(token);

var connections = {};


// COMMAND CODE =============================
// SENDERS
function sendError(channel, usage)
{
    channel.send("usage: " + usage);
}

function sendConfirm(channel)
{
    channel.send("command executed");
}


// HELPERS
function helperAutoResponse(enable, tag)
{
    if (!tag)
    {
        let arProps = Object.getOwnPropertyNames(arMap);
        for (let i = 0; i < arProps.length; ++i)
        {
            arMap[arProps[i]].enabled = enable;
        }
    }
    else
    {
        if (arMap[tag])
        {
            arMap[tag].enabled = enable;
        }
    }
}

function checkAndAdd(obj, name)
{
    if (!obj.hasOwnProperty(name))
    {
        obj[name] = undefined;
    }
}


// COMMANDS
function commandConnect(args, msg)
{
    if (!UBStorage.voiceMap.hasOwnProperty(msg.channel.id))
    {
        console.log("no associated voice channel");
        return;
    }

    let voiceID = UBStorage.voiceMap[msg.channel.id];
    let voiceChannel = client.channels.get(voiceID);
    voiceChannel.join()
        .then(connection => {connections[msg.channel.id] = connection;})
        .catch(()=>{console.log("could not join channel");}
    );
}

function commandDisconnect(args, msg)
{
    if (!connections.hasOwnProperty(msg.channel.id))
    {
        console.log("no connection established");
        return;
    }
    connections[msg.channel.id].disconnect();
    delete connections[msg.channel.id];
}

function commandDar(args, msg)
{
    if (args.length == 1)
    {
        helperAutoResponse(false, args[0]);
    }
    else
    {
        helperAutoResponse(false);
    }
    sendConfirm(msg.channel);
}

function commandDestroy(args, msg)
{
    let str = JSON.stringify(UBStorage);
    filesystem.writeFile('./storage/UtilityBotStorage.json', str, (err)=>
    {
        console.log('write succeeded');
    });
    client.destroy();
}

function commandEar(args, msg)
{
    if (args.length == 1)
    {
        helperAutoResponse(true, args[0]);
    }
    else
    {
        helperAutoResponse(true);
    }
    sendConfirm(msg.channel);
}

function commandHelp(args, msg)
{
    let help_msg = "**Howdy! I\'m Utility Bot. Here are my commands:**\n\n" +
        "**!help** = Chill, you already figured this one out.\n" +
        "**!enableAutoResponse [tag]** = Enables auto responses. Only affects the tagged AR if specified.\n" +
        "**!disableAutoResponse [tag]** = Disables auto responses. Only affects the tagged AR if specified\n" +
        "**!random min max** = Generates a random number in the range [min,max).";
    msg.channel.send(help_msg);
}

function commandPic(args, msg)
{
    if (args.length == 1)
    {
        let photo = photoMap[args[0]];
        if (photo)
        {
            msg.channel.send({ files: [photo]});
        }
        else
        {
            msg.channel.send("bro i dont have that one");
        }
    }
}

function commandPlay(args, msg)
{
    if (args.length != 1 || !connections.hasOwnProperty(msg.channel.id))
    {
        console.log("bad");
        return;
    }

    let file = voiceMap[args[0]];
    let conn = connections[msg.channel.id];
    let opt = { volume: undefined };

    if (args.length != 2)
    {
        opt.volume = 0.25
    }
    else
    {
        opt.volume = args[1];
    }

    conn.playFile(file, opt);
}

function commandTieVoiceChannel(args, msg)
{
    if (args.length != 1)
    {
        return;
    }

    checkAndAdd('voiceMap');
    UBStorage.voiceMap[msg.channel.id] = args[0];
}

function commandRandom(args, msg)
{
    let min, max;

    if (args && args.length == 2)
    {
        min = args[0];
        max = args[1];
    }
    else
    {
        sendError(msg.channel, "!random <start\> <end>");
    }

    let rand = Math.random();
    let num = Math.floor(rand * Math.floor(max - min)) + Math.floor(min);
    msg.channel.send(num.toString());
}

function process(command, msg)
{
    let args = command.args;
    switch (command.type)
    {
        case "help":
            commandHelp(msg);
            return;

        case "connect":
            commandConnect(args, msg);
            return;
        case "disconnect":
            commandDisconnect(args, msg);
            return;

        case "enableAutoResponse":
        case "ear":
            commandEar(args, msg);
            return;

        case "disableAutoResponse":
        case "dar":
            commandDar(args, msg);
            return;

        case "destroy":
            commandDestroy(args, msg);
            return;

        case "play":
            commandPlay(args, msg);
            return;

        case "random":
            // !u random <start> <end>
            commandRandom(args, msg);
            return;

        case "pic":
            // !u pic <tag>
            commandPic(args, msg);
            return;

        case "tieVoiceChannel":
            // !u tieVoiceChannel <channelID>
            commandTieVoiceChannel(args, msg);
    }
};


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

        process(command, msg);
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

