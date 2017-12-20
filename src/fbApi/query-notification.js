'use strict';

/* The service for call Facebook query notification API */

const transportAgentHolder = require('./transport-agent-holder');
const { fbGraphApiEndpoint } = require('./common.js');

const notificationsQuery = 'notifications?fields=title,created_time,updated_time,id,object{id},from,link&include_read=true';

module.exports = function ({ fbApiVersion, pageId, accessToken }) {
    let agent = {
        accessToken,
        pageNotificationApiUri: `${fbGraphApiEndpoint}/${fbApiVersion}/${pageId}/${notificationsQuery}`,
        query: null,
        queryNext: null
    };

    agent.query = async function(){
        let self = this;
        return transportAgentHolder.getAgent()({
            method: 'GET',
            uri: `${self.pageNotificationApiUri}&access_token=${self.accessToken}`,
            json: true
        })
        .then(([response, body])=>{
            return body;
        })
        .catch((err)=>{
            throw err;
        });
    };

    agent.queryNext = async function(next){
        let self = this;
        return transportAgentHolder.getAgent()({
            method: 'GET',
            uri: next,
            json: true
        })
        .then(([response, body])=>{
            return body;
        })
        .catch((err)=>{
            throw err;
        });
    };

    return agent;
}