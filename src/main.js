'use strict';

/* An app for detect Facebook page new post comments and generate events */

var defaultFbApiVersion = 'v2.11';

const transportAgentHolder = require('./fbApi/transport-agent-holder');
const stateStoreHolder = require('./store/state-store-holder');
const loggerHolder = require('./utils/logger-holder');

const getFbPageCommentEventApp = function (options) {
    options.fbApiVersion = options.fbApiVersion || defaultFbApiVersion;

    let queryNotificationAgent = require('./fbApi/query-notification')({
        fbApiVersion: options.fbApiVersion,
        pageId: options.pageId,
        accessToken: options.accessToken
    });

    let notificationFetcher = require('./utils/notification-fetcher')(queryNotificationAgent);

    let notificationDigestor = require('./utils/notification-digestor')();

    let fbPageCommentEventApp = {
        options,
        queryNotificationAgent,
        notificationFetcher,
        notificationDigestor,
        run: null,
        stop: null,
        getQueryAgent: transportAgentHolder.getAgent,
        setQueryAgent: transportAgentHolder.setAgent,
        getStateStore: stateStoreHolder.getStore,
        setStateStore: stateStoreHolder.setStore,
        getLogger: loggerHolder.getLogger,
        setLogger: loggerHolder.setLogger,
        scheduleJobTimer: null
    };

    fbPageCommentEventApp.run = async function (eventsCallback) {
        let self = this;

        let refetch = async function () {
            let newItems = await self.notificationFetcher.fetch();
            if (newItems && newItems.length) {
                let events = await self.notificationDigestor.digest(newItems);
                if (events && events.length) {
                    return Promise.resolve(eventsCallback(events));
                }
            }
            return;
        }

        try{
            await refetch();
        }catch(e){
            console.log(e)
        }
        self.scheduleJobTimer = setInterval(refetch, 30000);
        return;
    }

    fbPageCommentEventApp.stop = async function (eventsCallback) {
        let self = this;
        clearTimeout(self.scheduleJobTimer);
    }

    return fbPageCommentEventApp;
};

module.exports = getFbPageCommentEventApp;