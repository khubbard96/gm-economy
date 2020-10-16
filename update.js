const http = require('https');
const TOKEN = "DP68V8vM1rQlObR0qYAU7gxFXuWgwzIw1gKAUWrN";
const MESSAGES_LIMIT = 100;
var lastMessage = undefined

const writeJsonFile = require('write-json-file');
/*

{
    "likes_given": {
        "1234":0
    },
    "likes_received": {
        "1234": 0
    },
    "messages": {
        "1234": 0
    }
}

*/
var memberData = {
    likes_given: {},
    likes_received: {},
    messages: {}
};
var messagesFound = 0;

console.log("beginning");

function getMessages() {
    let beforeMessage = lastMessage ? "&before_id=" + lastMessage : "";
    http.get('https://api.groupme.com/v3/groups/43847120/messages?token=' + TOKEN + "&limit=" + MESSAGES_LIMIT + beforeMessage, (res) => {
    
    
        var rawData = "";
        res.on('data', (chunk) => {
            rawData += chunk;
        });
    
        res.on('end', () => {
            try {
                let messages = JSON.parse(rawData).response.messages;

                messages.forEach((mes) => {
                    /*let poster = mes.sender_id;
                    let content = mes.text;
                    if(!Object.keys(memberData).includes(poster)) {
                        memberData[poster] = [];
                    }
                    if(content != null) {
                        memberData[poster].push(content);
                    }*/
                    let poster = mes.sender_id;
                    let liked_by = mes.favorited_by;
                    let likes_received = mes.favorited_by.length;

                    if(!Object.keys(memberData.messages).includes(poster)) {
                        memberData.messages[poster] = 0;
                    }
                    memberData.messages[poster] += 1;

                    if(!Object.keys(memberData.likes_received).includes(poster)) {
                        memberData.likes_received[poster] = 0;
                    }
                    memberData.likes_received[poster] += likes_received;

                    liked_by.forEach((liker) => {
                        if(!Object.keys(memberData.likes_given).includes(liker)) {
                            memberData.likes_given[liker] = 0;
                        }
                        memberData.likes_given[liker] += 1;
                    });

                    
                    

                    messagesFound += 1;
                    process.stdout.write("\r\x1b[K")
                    process.stdout.write("Messages found: " + messagesFound);

                });

                lastMessage = messages[messages.length - 1].id;
                if(messages.length == MESSAGES_LIMIT) {
                    getMessages();
                } else {
                    finish();
                }
            } catch {

            }
        });
    });
}

function finish() {
    (async () => {
        await writeJsonFile('data.json', memberData);
    })();
}

getMessages();
