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
        this.counter++;
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

        if (this.counter > 3) {
            return [{
                statusCode: 200,
                headers: {
                    'x-page-usage': '{"call_count":1,"total_cputime":1,"total_time":1}',
                    'x-app-usage': '{"call_count":1,"total_cputime":1,"total_time":1}'
                }
            }, dummyResponse];
        } else {
            return [{
                statusCode: 400,
                headers: {}
            }, '{"error":{"message":"Error validating access token: Session has expired on Saturday, 23-Dec-17 11:00:00 PST. The current time is Wednesday, 27-Dec-17 09:21:16 PST.","type":"OAuthException","code":190,"error_subcode":463,"fbtrace_id":"XXXXXXXXXXX"}}'];
        }
    }.bind({ counter: 0 });

    let mockTransportAgent2 = async function (options) {
        this.counter++;
        let dummyResponse = testData[0];

        let uri = options.uri;

        if (this.counter > 3) {
            return [{
                statusCode: 200,
                headers: {
                    'x-page-usage': '{"call_count":1,"total_cputime":1,"total_time":1}',
                    'x-app-usage': '{"call_count":1,"total_cputime":1,"total_time":1}'
                }
            }, dummyResponse];
        } else {
            return [{
                statusCode: 400,
                headers: {}
            }, '{"error":{"message":"Error validating access token: Session has expired on Saturday, 23-Dec-17 11:00:00 PST. The current time is Wednesday, 27-Dec-17 09:21:16 PST.","type":"OAuthException","code":190,"error_subcode":463,"fbtrace_id":"XXXXXXXXXXX"}}'];
        }
    }.bind({ counter: 0 });

    let lib = require('./../src/lib');
    let mockApp;

    beforeEach(function (done) {
        mockApp = lib.pageCommentEventApp({
            accessToken: 'yyyyyy',
            pullInterval: 100
        });

        lib.setLogger(silentLogger);

        done();
    });

    it("Test fetch feeds", function (done) {

        lib.setQueryAgent(mockTransportAgent);

        mockApp.registerMonitorFeedPage(testPageId);
        expect(mockApp.getMonitorFeedPages()).to.eqls([testPageId])
        mockApp.deregisterMonitorFeedPage(testPageId);
        expect(mockApp.getMonitorFeedPages()).to.eqls([])

        mockApp.registerMonitorPost(testPageId, testPostId[0]);
        mockApp.registerMonitorPost(testPageId, testPostId[1]);
        expect(mockApp.getMonitorPosts()).to.eqls([`${testPageId}_${testPostId[0]}`, `${testPageId}_${testPostId[1]}`]);
        mockApp.deregisterMonitorPost(testPageId, testPostId[0]);
        mockApp.deregisterMonitorPost(testPageId, testPostId[1]);
        expect(mockApp.getMonitorPosts()).to.eqls([]);

        mockApp.registerMonitorFeedPage(testPageId);

        let counter = 0;
        mockApp.run((events) => {
            counter++;
            if (counter > 3) {
                return done();
            }
        });
    });

    it("Test fetch posts", function (done) {

        lib.setQueryAgent(mockTransportAgent2);

        mockApp.registerMonitorPost(testPageId, testPostId[0]);
        mockApp.registerMonitorPost(testPageId, testPostId[1]);

        let counter = 0;
        mockApp.run((events) => {
            counter++;
            if (counter > 3) {
                return done();
            }
        });
    });

    afterEach(function (done) {
        mockApp.stop().then(() => {
            done();
        });
    });
});