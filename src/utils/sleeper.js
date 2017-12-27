'use strict';

const timers = new Map();

function sleep(ms) {
    return new Promise((resolve, reject) => {
        let timer = null;
        timer = setTimeout(function () {
            timers.delete(timer);
            return resolve();
        }, ms);
        timers.set(timer, reject);
    });
}

function clearAllTimers() {
    let deleteTimers = [];
    for (let [timer, reject] of timers) {
        clearTimeout(timer);
        reject(new Error('timer interrupted.'));
        deleteTimers.push(timer);
    }
    for (let timer of deleteTimers) {
        timers.delete(timer);
    }
}

module.exports = {
    sleep,
    clearAllTimers
}