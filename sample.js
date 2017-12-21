'use strict';

const fbPageCommentEventApp = require('./src/main.js')({
    pageId : 'xxxxxx',
    accessToken : 'yyyyyy'
});

fbPageCommentEventApp.run((events)=>{
    console.log(JSON.stringify(events, null, 2));
});