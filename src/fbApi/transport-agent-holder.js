'use strict';

/* Holding the agent for sending request */

const defaultAgent = require('./../utils/request-promise');

const transportAgentHolder = {
    agent: defaultAgent,
    getAgent: null,
    setAgent: null
};

transportAgentHolder.getAgent = function(){
    return this.agent;
}.bind(transportAgentHolder);

transportAgentHolder.setAgent = function(agent){
    this.agent = agent;
}.bind(transportAgentHolder);

module.exports = transportAgentHolder;