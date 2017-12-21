'use strict';

/* The service for call Facebook query notification API */

const transportAgentHolder = require('./transport-agent-holder');
const { fbGraphApiEndpoint } = require('./common.js');
const loggerHolder = require('./../utils/logger-holder');
const feedQueryUrlTemplate = 'feed?fields=id,permalink_url,comments.limit(100).order(reverse_chronological).since(%since%){message,created_time,comment_count,from,id,permalink_url}&limit=5';

const queryFeedAgent = function ({ fbApiVersion, pageId, accessToken }) {
    let agent = {
        accessToken,
        apiUri: `${fbGraphApiEndpoint}/${fbApiVersion}/${pageId}/${feedQueryUrlTemplate}`,
        query: null,
        queryNext: null
    };

    agent.query = async function(since){
        let self = this;
        return transportAgentHolder.getAgent()({
            method: 'GET',
            uri: `${self.apiUri.replace(/%since%/g, since)}&access_token=${self.accessToken}`,
            json: true
        })
        .then(([response, body])=>{
            if (response.statusCode !== 200){
                loggerHolder.getLogger().error('Invalid response statusCode '+response.statusCode+', body: '+body?JSON.stringify(body):'');
                throw new Error('Invalid response statusCode '+response.statusCode);
            }
            return body;
        })
        .catch((err)=>{
            throw err;
        });
    };

    return agent;
}

module.exports = queryFeedAgent;