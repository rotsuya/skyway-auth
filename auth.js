'use strict';

const express = require('express');
const app = express();
const multer = require('multer');
const upload = multer();
const rp = require('request-promise-native');
const CryptoJS = require('crypto-js');
require('dotenv').config();
const randomstring = require('randomstring');

const SKYWAY_SECRET_KEY = process.env.SKYWAY_SECRET_KEY;
const CREDENTIAL_TTL = 3600; // 1 hour
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_API_URL = 'https://www.google.com/recaptcha/api/siteverify';
const ALLOWED_ORIGINS = [
    'http://localhost:4000',
    'https://rotsuya.github.io',
    'https://skyway-lab.github.io'
];

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (ALLOWED_ORIGINS.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    }
    next();
});

app.post('/authenticate', upload.fields([]), (req, res) => {
    const peerId = req.body.peerId || randomstring.generate({
        length:   16,
        readable: true
    });

    const recaptchaResponse = req.body['g-recaptcha-response'];
    const remoteAddress = req.connection.remoteAddress;

    if (!recaptchaResponse) {
        res.status(400).send('Bad Request');
    }

    verifyRecaptcha(recaptchaResponse, remoteAddress)
        .then(() => {
            const unixTimestamp = Math.floor(Date.now() / 1000);

            const credential = {
                peerId: peerId,
                timestamp: unixTimestamp,
                ttl: CREDENTIAL_TTL,
                authToken: calculateAuthToken(peerId, unixTimestamp)
            };

            res.json({
                peerId: peerId,
                timestamp: unixTimestamp,
                ttl: CREDENTIAL_TTL,
                authToken: calculateAuthToken(peerId, unixTimestamp)
            });
        }).catch(() => {
            res.status(401).send('Authentication Failed');
        });
});

function verifyRecaptcha(recaptchaResponse, remoteAddress) {
    return new Promise((resolve, reject) => {
        const options = {
            uri: RECAPTCHA_API_URL,
            qs: {
                secret: RECAPTCHA_SECRET_KEY,
                response: recaptchaResponse,
                remoteip: remoteAddress
            },
            json: true
        };
        rp(options)
            .then(json => {
                if (!json.success) {
                    console.error(json['error-codes']);
                    reject();
                }
                resolve();
            }).catch(error => {
                console.error(error);
                reject();
            });
    });
}

function calculateAuthToken(peerId, timestamp) {
    // calculate the auth token hash
    const hash = CryptoJS.HmacSHA256(`${timestamp}:${CREDENTIAL_TTL}:${peerId}`, SKYWAY_SECRET_KEY);

    // convert the hash to a base64 string
    return CryptoJS.enc.Base64.stringify(hash);
}

const listener = app.listen(process.env.PORT || 8080, () => {
    console.log(`Server listening on port ${listener.address().port}`)
});

app.use(express.static('public'));