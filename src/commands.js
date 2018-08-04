const Discord = require('discord.js');
const auth = require('../auth.json');
const arMap = require('../storage/arMap.json');
const photoMap = require('../storage/photoMap.json');
const UBStorage = require('../storage/UtilityBotStorage');
const commands = require('./commands.js');

function helperAutoResponse(enable, tag)
{
    if (tag)
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

function commandDar(args, msg)
{
    if (command.args.length == 1)
    {
        helperAutoResponse(false, command.args[0]);
    }
    else
    {
        helperAutoResponse(false);
    }
    sendConfirm(msg.channel);
}

function commandEar(args, msg)
{
    if (command.args.length == 1)
    {
        helperAutoResponse(true, command.args[0]);
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

module.exports = {
    process: function (command, msg)
    {
        let args = command.args;
        switch (command.type)
        {
            case "help":
                commandHelp(msg);
                return;

            case "enableAutoResponse":
            case "ear":
                commandEar(args, msg);
                return;

            case "disableAutoResponse":
            case "dar":
                commandDar(args, msg);
                return;

            case "random":
                commandRandom(args, msg);
                return;

            case "pic":
                commandPic(args, msg);
                return;
        }
    }
};



