'use strict';

/* An app for detect Facebook page new post comments and generate events */

var defaultFbApiVersion = 'v2.11';

const transportAgentHolder = require('./fbApi/transport-agent-holder');
const stateStoreHolder = require('./store/state-store-holder');
const loggerHolder = require('./utils/logger-holder');

const getFbPageCommentEventApp = function (options) {
    options.fbApiVersion = options.fbApiVersion || defaultFbApiVersion;

    let queryFeedAgent = require('./fbApi/query-feed')({
        fbApiVersion: options.fbApiVersion,
        pageId: options.pageId,
        accessToken: options.accessToken
    })

    let feedFetcher = require('./utils/feed-fetcher')(queryFeedAgent);

    let feedDigestor = require('./utils/feed-digestor')();

    let fbPageCommentEventApp = {
        options,
        feedFetcher,
        feedDigestor,
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
            let newItems = await self.feedFetcher.fetch();
            if (newItems && newItems.length) {
                let events = await self.feedDigestor.digest(newItems);
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
        self.scheduleJobTimer = setInterval(refetch, 30*1000);
        return;
    }

    fbPageCommentEventApp.stop = async function () {
        let self = this;
        clearTimeout(self.scheduleJobTimer);
        self.scheduleJobTimer = null;
        return;
    }

    return fbPageCommentEventApp;
};

module.exports = getFbPageCommentEventApp;