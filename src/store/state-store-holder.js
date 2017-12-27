'use strict';

/* Holding the store for remembering last checked status metadata */

const defaultStore = require('./memory-state-store');

const stateStoreHolder = {
    store: defaultStore,
    getStore: null,
    setStore: null
};

stateStoreHolder.getStore = function () {
    return this.store;
}.bind(stateStoreHolder);

stateStoreHolder.setStore = function (store) {
    this.store = store;
}.bind(stateStoreHolder);

module.exports = stateStoreHolder;