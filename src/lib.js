'use strict';

/* An app for detect Facebook page new post comments and generate events */

var defaultFbApiVersion = 'v2.11';
const transportAgentHolder = require('./fbApi/transport-agent-holder');
const stateStoreHolder = require('./store/state-store-holder');
const loggerHolder = require('./utils/logger-holder');
const { sleep, clearAllTimers } = require('./utils/sleeper');

const lib = {
    api: {
        getQueryFeedAgent: null,
        getQueryPostCommentAgent: null,
        getFeedFetcher: null,
        getPostCommentFetcher: null,
        getPostDigestor: null,
    },
    getQueryAgent: transportAgentHolder.getAgent,
    setQueryAgent: transportAgentHolder.setAgent,
    getStateStore: stateStoreHolder.getStore,
    setStateStore: stateStoreHolder.setStore,
    getLogger: loggerHolder.getLogger,
    setLogger: loggerHolder.setLogger,
    pageCommentEventApp: null
}

lib.api.getQueryFeedAgent = require('./fbApi/query-feed-comments');
lib.api.getQueryPostCommentAgent = require('./fbApi/query-post-comments');
lib.api.getFeedFetcher = require('./fetchers/feed-fetcher');
lib.api.getPostCommentFetcher = require('./fetchers/post-comment-fetcher');
lib.api.getPostDigestor = require('./events/post-digestor');

lib.pageCommentEventApp = function (options) {
    options = options || {};
    if (!options.accessToken) {
        throw new Error('No access token provided!');
    }

    let queryFeedAgent = lib.api.getQueryFeedAgent({
        fbApiVersion: options.fbApiVersion,
        accessToken: options.accessToken
    });

    let queryPostCommentAgent = lib.api.getQueryPostCommentAgent({
        fbApiVersion: options.fbApiVersion,
        accessToken: options.accessToken
    });

    let feedFetcher = lib.api.getFeedFetcher(queryFeedAgent);
    let postCommentFetcher = lib.api.getPostCommentFetcher(queryPostCommentAgent);

    let postDigestor = lib.api.getPostDigestor();

    let pageCommentEventApp = {
        options: {
            pullInterval: options.pullInterval || 30 * 1000
        },
        _internal: {
            feedFetcher,
            postCommentFetcher,
            postDigestor,
            _runningStatus: 0,
            monitorFeedPages: {},
            monitorPosts: {}
        },
        run: null,
        stop: null,
        registerMonitorFeedPage: null,
        deregisterMonitorFeedPage: null,
        getMonitorFeedPages: null,
        registerMonitorPost: null,
        deregisterMonitorPost: null,
        getMonitorPosts: null
    };

    pageCommentEventApp.run = async function (eventsCallback) {
        let self = this;
        self._internal._runningStatus = 1;

        let refetch = async function () {

            { //fetch feed pages
                let monitoringPageIds = self.getMonitorFeedPages();
                for (let pageId of monitoringPageIds) {
                    try {
                        let newItems = await self._internal.feedFetcher.fetch(pageId)
                        if (newItems && newItems.length) {
                            let events = await self._internal.postDigestor.digest(newItems);
                            if (events && events.length) {
                                return Promise.resolve(eventsCallback(events));
                            }
                        }
                    } catch (e) {
                        loggerHolder.getLogger().error(e);
                    }
                }
            }

            { //fetch posts comments
                let newItems = [];
                let monitoringPostIds = self.getMonitorPosts();
                for (let postId of monitoringPostIds) {
                    try {
                        let newItems_ = await self._internal.postCommentFetcher.fetch(postId)
                        newItems.push(...newItems_);
                    } catch (e) {
                        loggerHolder.getLogger().error(e);
                    }
                }

                if (newItems && newItems.length) {
                    let events = await self._internal.postDigestor.digest(newItems);
                    if (events && events.length) {
                        return Promise.resolve(eventsCallback(events));
                    }
                }
            }
            return;
        }

        while (self._internal._runningStatus == 1) {
            try {
                await refetch();
            } catch (e) {
                loggerHolder.getLogger().error(e);
            }

            try {
                await sleep(self.options.pullInterval);
            } catch (e) {}
        }
        return;
    }

    pageCommentEventApp.stop = async function () {
        let self = this;
        self._internal._runningStatus = 2;
        clearAllTimers();
        return;
    }

    pageCommentEventApp.registerMonitorFeedPage = function (pageId) {
        this._internal.monitorFeedPages[pageId] = pageId;
        lib.getStateStore().setPageFeedLastScannedCommentTime(pageId, Math.trunc(Date.now() / 1000));
    }

    pageCommentEventApp.deregisterMonitorFeedPage = function (pageId) {
        delete this._internal.monitorFeedPages[pageId];
        lib.getStateStore().setPageFeedLastScannedCommentTime(pageId, null);
    }

    pageCommentEventApp.getMonitorFeedPages = function () {
        return Object.keys(this._internal.monitorFeedPages);
    }

    pageCommentEventApp.registerMonitorPost = function (...args) {
        let postObjId;

        if (args.length === 2) {
            let pageId = args[0];
            let postId = args[1];
            postObjId = `${pageId}_${postId}`;
        } else if (args.length === 1 && typeof args[0] === 'object' && args[0].pageId && args[0].postId) {
            let pageId = args[0].pageId;
            let postId = args[0].postId;
            postObjId = `${pageId}_${postId}`;
        }

        this._internal.monitorPosts[postObjId] = postObjId;
        lib.getStateStore().setPostLastScannedCommentTime(postObjId, Math.trunc(Date.now() / 1000));
    }

    pageCommentEventApp.deregisterMonitorPost = function (pageId, postId) {
        let postObjId = `${pageId}_${postId}`;
        delete this._internal.monitorPosts[postObjId];
        lib.getStateStore().setPostLastScannedCommentTime(postObjId, null);
    }

    pageCommentEventApp.getMonitorPosts = function () {
        return Object.keys(this._internal.monitorPosts);
    }

    if (options.monitorFeedPage) {
        pageCommentEventApp.registerMonitorFeedPage(options.monitorFeedPage)
    }
    if (options.monitorPosts && options.monitorPosts.length) {
        for (let postObjId of options.monitorPosts) {
            pageCommentEventApp.registerMonitorPost(postObjId)
        }
    }

    return pageCommentEventApp;
};

module.exports = lib;