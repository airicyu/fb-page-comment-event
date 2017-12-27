'use strict';

/* Promisify request library */

const request = require('request');

const rp = async function (options) {
    return new Promise((resolve, reject) => {
        request(options, function (error, response, body) {
            if (error) {
                return reject(error);
            } else {
                return resolve([response, body]);
            }
        })
    });
}

module.exports = rp;