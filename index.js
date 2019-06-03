const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const request = require('request');
var cors = require('cors');
app.use(express.static('public'));
const dbConfig = require('./src/config');

const app = express();
const port = process.env.PORT || 5000;
const PAGE_ACCESS_TOKEN = 'EAAgC92X2sWYBAOd7bZBFCKHifsZBAjrkP7zTg1GWiblgXPdh1VHHZCnF4bvFdDEQ5rOhirorlNXPYv1bTESc1WaVxdBq73U9nowzNjF1AlZAW79Jr43yBjJOvTxfisO5gRJ49wFnjBP6Ia5LZAobccb5nylIppGAD75SB5TShxFJHVx8b9tGN';

app.use(cors());

// Configure bodyparser to handle post requests
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Connecting to the database
mongoose.connect(dbConfig.database, {
    useNewUrlParser: true
}).then(() => {
    console.log('Successfully connected to the database');
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
});

app.get('/', (req, res) => {
    res.send('Hello World');
});

// Serve the options path and set required headers
app.get('/options', (req, res, next) => {
    let referer = req.get('Referer');
    if (referer) {
        if (referer.indexOf('www.messenger.com') >= 0) {
            res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.messenger.com/');
        } else if (referer.indexOf('www.facebook.com') >= 0) {
            res.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.facebook.com/');
        }
        res.sendFile('public/options.html', { root: __dirname });
    }
});

// Handle postback from webview
app.get('/optionspostback', (req, res) => {
    let body = req.query;
    let response = {
        'text': `Great, I will book you a ${body.bed} bed, with ${body.pillows} pillows and a ${body.view} view.`
    };

    res.status(200).send('Please close this window to return to the conversation thread.');
    callSendAPI(body.psid, response);
});

// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {

    let body = req.body;

    // Checks this is an event from a page subscription
    if (body.object === 'page') {

        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function (entry) {

            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);


            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }
        });

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = 'vertifyToken123456';

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});

require('./src/routes/note.route')(app);

app.listen(port, () => {
    console.log('Start app ' + port);
});

// Define the template and webview
function setRoomPreferences(sender_psid) {
    let response = {
        attachment: {
            type: 'template',
            payload: {
                template_type: 'button',
                text: 'OK, let\'s set your room preferences so I won\'t need to ask for them in the future.',
                buttons: [{
                    type: 'web_url',
                    url: 'https://crudnodejs-hitex.herokuapp.com/' + '/options',
                    title: 'Set preferences',
                    webview_height_ratio: 'compact',
                    messenger_extensions: true
                }]
            }
        }
    };

    return response;
}

// Handles messages events
function handleMessage(sender_psid, received_message) {
    let response;

    // Checks if the message contains text
    if (received_message.text) {
        switch (received_message.text.replace(/[^\w\s]/gi, '').trim().toLowerCase()) {
            case 'room preferences':
                response = setRoomPreferences(sender_psid);
                break;
            default:
                response = {
                    'text': `You sent the message: '${received_message.text}'.`
                };
                break;
        }
    } else {
        response = {
            'text': 'Sorry, I don\'t understand what you mean.'
        };
    }

    // Send the response message
    callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
    let response;

    // Get the payload for the postback
    let payload = received_postback.payload;

    // Set the response based on the postback payload
    if (payload === 'yes') {
        response = { 'text': 'Thanks!' };
    } else if (payload === 'no') {
        response = { 'text': 'Oops, try sending another image.' };
    }
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
        'recipient': {
            'id': sender_psid
        },
        'message': response
    };

    // Send the HTTP request to the Messenger Platform
    request({
        'uri': 'https://graph.facebook.com/v2.6/me/messages',
        'qs': { 'access_token': PAGE_ACCESS_TOKEN },
        'method': 'POST',
        'json': request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!');
        } else {
            console.error('Unable to send message:' + err);
        }
    });
}
