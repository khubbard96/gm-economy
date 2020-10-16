var HTTPS = require('https');
const loadJsonFile = require('load-json-file');
var loading = true;
var memberBalances = {};
const DAY_IN_MS = 86400000;

var botID;

//load markov chains subroutine
(async () => {
    const config = await loadJsonFile("config.json");
    botID = config.bot_id;
})();

async function reload() {
    loading = true;
    const data = await loadJsonFile('data.json');

    memberBalances = {};

    Object.keys(data.likes_given).forEach((usr) => {
        if(!Object.keys(memberBalances).includes(usr)) {
            memberBalances[usr] = 0;
        }
        memberBalances[usr] -= 2 * data.likes_given[usr];
    });

    Object.keys(data.likes_received).forEach((usr) => {
        if(!Object.keys(memberBalances).includes(usr)) {
            memberBalances[usr] = 0;
        }
        memberBalances[usr] += 2 * data.likes_given[usr];
    });

    Object.keys(data.messages).forEach((usr) => {
        if(!Object.keys(memberBalances).includes(usr)) {
            memberBalances[usr] = 0;
        }
        memberBalances[usr] -= data.messages[usr];
    });


    loading = false;
}
setInterval(reload, DAY_IN_MS);
reload();

function respond() {
    var request = JSON.parse(this.req.chunks[0]), botRegex = /what'?s my balance/gmi;
    if (request.text && botRegex.test(request.text) && !loading) {
        this.res.writeHead(200);
        postMessage(request.sender_id);
        this.res.end();
    } else {
        console.log("don't care");
        this.res.writeHead(200);
        this.res.end();
    }
}

function postMessage(userId) {
    var botResponse, options, body, botReq;

    botResponse = getBalance(userId);

    options = {
        hostname: 'api.groupme.com',
        path: '/v3/bots/post',
        method: 'POST'
    };

    body = {
        "bot_id": botID,
        "text": botResponse
    };

    console.log('sending ' + botResponse + ' to ' + botID);

    botReq = HTTPS.request(options, function (res) {
        if (res.statusCode == 202) {
            //neat
        } else {
            console.log('rejecting bad status code ' + res.statusCode);
        }
    });

    botReq.on('error', function (err) {
        console.log('error posting message ' + JSON.stringify(err));
    });
    botReq.on('timeout', function (err) {
        console.log('timeout posting message ' + JSON.stringify(err));
    });
    botReq.end(JSON.stringify(body));
}

function getBalance(userID) {
    return `Your balance is $${memberBalances[userID]}`;
}




exports.respond = respond;