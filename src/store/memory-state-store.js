'use strict';

/* Store for last checked notification item time in memory */

const _store = {};
_store['lastNotificationUpdateTime'] = Date.now();

const store = {
    getLastNotificationUpdateTime: null,
    setLastNotificationUpdateTime: null
};

store.getLastNotificationUpdateTime = async function () {
    return _store['lastNotificationUpdateTime'];
};

store.setLastNotificationUpdateTime = async function (value) {
    _store['lastNotificationUpdateTime'] = value;
    return;
};

module.exports = store;