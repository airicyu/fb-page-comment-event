'use strict';

/* Logger service */

const winston = require('winston');
const defaultLogger = winston.createLogger({
    transports: [
      new winston.transports.Console({ level: 'debug' })
    ]
});

const loggerHolder = {
    logger: defaultLogger,
    getLogger: null,
    setLogger: null
};

loggerHolder.getLogger = function(){
    return this.logger;
}.bind(loggerHolder);

loggerHolder.setLogger = function(logger){
    this.logger = logger;
}.bind(loggerHolder);

module.exports = loggerHolder;