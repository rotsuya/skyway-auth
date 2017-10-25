'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const hmac = require('crypto-js/hmac-sha256');
const CryptoJS = require('crypto-js');

const fs = require('fs');
require('dotenv').config();

/************************************************
 *            Config section start              *
 *         replace with your own values         *
 ************************************************/

const secretKey = process.env.SECRET_KEY;
const credentialTTL = 3600; // 1 hour

/************************************************
 *            Config section finished           *
 ************************************************/

const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(cookieParser());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.post('/authenticate', (req, res) => {
    const peerId = req.body.peerId;
    const sessionToken = req.cookies.sessionToken;

    if(peerId === undefined || sessionToken === undefined) {
        res.status(400).send('Bad Request');
        return;
    }

    checkSessionToken(peerId, sessionToken).then(() => {
        // Session token check was successful.

        // We need the current unix timestamp. Date.now() returns in milliseconds so divide by 1000 to get seconds.
        const unixTimestamp = Math.floor(Date.now() / 1000);

        const credential = {
            timestamp: unixTimestamp,
            ttl: credentialTTL,
            authToken: calculateAuthToken(peerId, unixTimestamp)
        };

        res.send(credential);
    }).catch((error) => {
        console.error(error);
        // Session token check failed
        res.status(401).send('Authentication Failed');
    });
});

app.get('/skyway-auth.js', (req, res) => {
    fs.readFile('static/skyway-auth.js', function(err, data){
        res.cookie('sessionToken', 'secret');
        res.set('Content-Type', 'application/javascript');
        res.send(data);
    });
});

const listener = app.listen(process.env.PORT || 8080, () => {
    console.log(`Server listening on port ${listener.address().port}`)
});

function checkSessionToken(peerId, token) {
    return new Promise((resolve, reject) => {
        if (token !== 'secret') {
            reject();
        }
        // Implement checking whether the session is valid or not.
        // Resolve if the session token is valid.
        // Reject if it is invalid.

        resolve();
    });
}

function calculateAuthToken(peerId, timestamp) {
    // calculate the auth token hash
    const hash = CryptoJS.HmacSHA256(`${timestamp}:${credentialTTL}:${peerId}`, secretKey);

    // convert the hash to a base64 string
    return CryptoJS.enc.Base64.stringify(hash);
}

app.use(express.static('public'));