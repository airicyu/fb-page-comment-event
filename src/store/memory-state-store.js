'use strict';

/* Store for last checked notification item time in memory */

const _store = {};
_store['lastNotificationUpdateTime'] = Date.now();
_store['lastScannedCommentTime'] = Math.round(Date.now()/1000);

const store = {
    getLastScannedCommentTime: null,
    setLastScannedCommentTime: null
};

store.getLastScannedCommentTime = async function () {
    return _store['lastScannedCommentTime'];
};

store.setLastScannedCommentTime = async function (value) {
    _store['lastScannedCommentTime'] = value;
    return;
};

module.exports = store;