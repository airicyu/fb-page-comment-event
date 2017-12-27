'use strict';

/* The service for call Facebook query feed API */

const transportAgentHolder = require('./transport-agent-holder');
const { fbGraphApiEndpoint: defaultFbGraphApiEndpoint, defaultFbApiVersion } = require('./../common.js');
const loggerHolder = require('./../utils/logger-holder');
const feedQueryUrlTemplate = '%pageId%/feed?fields=id,permalink_url,comments.limit(100).order(reverse_chronological).since(%since%){message,created_time,comment_count,from,id,permalink_url}&limit=10';
//TODO limit handling

const queryFeedAgent = function (options) {

    let fbApiVersion = options.fbApiVersion || defaultFbApiVersion;
    let accessToken = options.accessToken;
    let fbGraphApiEndpoint = options.fbGraphApiEndpoint || defaultFbGraphApiEndpoint;

    let agent = {
        accessToken,
        apiUri: `${fbGraphApiEndpoint}/${fbApiVersion}/${feedQueryUrlTemplate}`,
        query: null
    };

    agent.query = async function (pageId, since) {
        let self = this;

        return transportAgentHolder.getAgent()({
                method: 'GET',
                uri: `${self.apiUri.replace(/%pageId%/g, pageId).replace(/%since%/g, since)}&access_token=${self.accessToken}`,
                json: true
            })
            .then(([response, body]) => {
                if (response.statusCode !== 200) {
                    loggerHolder.getLogger().error('Invalid response statusCode ' + response.statusCode + ', headers: ' + JSON.stringify(response.headers) + ', body: ' + (body ? JSON.stringify(body) : ''));
                    throw new Error('Invalid response statusCode ' + response.statusCode);
                }

                loggerHolder.getLogger().debug(`quey feed comments: pageId: ${pageId}, x-page-usage: ${response.headers['x-page-usage']}, x-app-usage: ${response.headers['x-app-usage']}`);
                return body;
            });
    };

    return agent;
}

module.exports = queryFeedAgent;