'use strict';

const should = require('chai').should;
const expect = require('chai').expect;
const winston = require('winston');
const silentLogger = winston.createLogger({
    transports: [
        new winston.transports.Console({ level: 'crit' })
    ]
});
const moment = require('moment');

describe('Test monitor event app', function () {
    this.timeout(30000);

    let testPageId = '1620123456789123';
    let testPostId = ['1620512345678912'];
    let testFromUserName = 'John Chan';
    let testFromUserId = '10123456789123456';
    let testCommentId = ['1620720123456788'];
    let testCommentText = ['testing comment'];

    let testData = [{
        "id": `${testPageId}_${testPostId[0]}`,
        "permalink_url": `https://www.facebook.com/permalink.php?story_fbid=${testPostId[0]}&id=${testPageId}`,
        "comments": {
            "data": [{
                "message": testCommentText[0],
                "created_time": moment().add(2, 'hours').format(),
                "comment_count": 0,
                "from": {
                    "name": testFromUserName,
                    "id": testFromUserId
                },
                "id": `${testPostId}_${testCommentId[0]}`,
                "permalink_url": `https://www.facebook.com/permalink.php?story_fbid=${testPostId}&id=${testPageId}&comment_id=${testCommentId[0]}`
            }],
            "paging": {
                "cursors": {
                    "before": "abc",
                    "after": "def"
                }
            }
        }
    }];

    let mockTransportAgent = async function (options) {
        let dummyResponse = {
            data: testData,
            paging: {
                cursors: {
                    before: "WTI5",
                    after: "WTI5"
                }
            }
        };

        let uri = options.uri;

        return [{
            statusCode: 200,
            headers: {
                'x-page-usage': '{"call_count":1,"total_cputime":1,"total_time":1}',
                'x-app-usage': '{"call_count":1,"total_cputime":1,"total_time":1}'
            }
        }, dummyResponse];
    };

    let mockTransportAgent2 = async function (options) {
        let dummyResponse = testData[0];

        let uri = options.uri;

        return [{
            statusCode: 200,
            headers: {
                'x-page-usage': '{"call_count":1,"total_cputime":1,"total_time":1}',
                'x-app-usage': '{"call_count":1,"total_cputime":1,"total_time":1}'
            }
        }, dummyResponse];
    };

    let mockApp;

    let lib = require('./../src/lib');

    before(function (done) {
        lib.setLogger(silentLogger);

        done();
    });

    it("Test API", function (done) {

        /* getQueryFeedAgent: null,
        getQueryPostCommentAgent: null,
        getFeedFetcher: null,
        getPostCommentFetcher: null,
        getPostDigestor: null, */

        (async function () {
            let dummyAccessToken = 'XXX...ZZZ';
            lib.setQueryAgent(mockTransportAgent);

            let queryFeedAgent = lib.api.getQueryFeedAgent({accessToken: dummyAccessToken});
            let feedFetcher = lib.api.getFeedFetcher(queryFeedAgent);
            let newItems = await feedFetcher.fetch(testPageId);
            
            expect(newItems.length).gt(0);
            
            
            lib.setQueryAgent(mockTransportAgent2);

            let queryPostCommentAgent = lib.api.getQueryPostCommentAgent({accessToken: dummyAccessToken});
            let postCommentFetcher = lib.api.getPostCommentFetcher(queryPostCommentAgent);
            let newItems2 = await postCommentFetcher.fetch(`${testPageId}_${testPostId}`);

            expect(newItems2.length).gt(0);


            let postDigestor = lib.api.getPostDigestor();
            let event = await postDigestor.digest(newItems);
            let event2 = await postDigestor.digest(newItems2);

            expect(event.length).gt(0);
            expect(event2.length).gt(0);
            
        })().then(() => {
            done();
        });

    });

});