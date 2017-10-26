'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const hmac = require('crypto-js/hmac-sha256');
const CryptoJS = require('crypto-js');

const fs = require('fs');
require('dotenv').config();
const randomstring = require('randomstring');

const secretKey = process.env.SECRET_KEY;
const credentialTTL = 3600; // 1 hour
const sessionTokens = [];

const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(cookieParser());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/skyway-auth.js', (req, res) => {
    fs.readFile('static/skyway-auth.js', function(err, data){
        const sessionToken = randomstring.generate({
            length:   16,
            readable: true
        });
        sessionTokens.push(sessionToken);
        res.header('Cache-Control', ['private', 'no-store', 'no-cache', 'must-revalidate', 'proxy-revalidate'].join(','));
        res.header('no-cache', 'Set-Cookie');
        res.cookie('sessionToken', sessionToken);
        res.set('Content-Type', 'application/javascript');
        res.send(data);
    });
});

app.post('/authenticate', (req, res) => {
    const peerId = req.body.peerId || randomstring.generate({
        length:   16,
        readable: true
    });
    const sessionToken = req.cookies.sessionToken;

    if (sessionToken === undefined) {
        res.status(400).send('Bad Request');
        return;
    }

    checkSessionToken(res, sessionToken).then(() => {
        const unixTimestamp = Math.floor(Date.now() / 1000);

        const credential = {
            peerId: peerId,
            timestamp: unixTimestamp,
            ttl: credentialTTL,
            authToken: calculateAuthToken(peerId, unixTimestamp)
        };

        res.send(credential);
    }).catch((error) => {
        // Session token check failed
        console.error(error);
        res.status(401).send('Authentication Failed');
    });
});

const listener = app.listen(process.env.PORT || 8080, () => {
    console.log(`Server listening on port ${listener.address().port}`)
});

function checkSessionToken(res, sessionToken) {
    return new Promise((resolve, reject) => {
        if (!sessionTokens.includes(sessionToken)) {
            reject();
        }
        sessionTokens.pop(sessionToken);
        res.clearCookie('sessionToken');
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