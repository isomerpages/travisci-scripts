const request = require("request");
const SLACK_URI = process.env.SLACK_URI;

const testSuiteHandler = require("./test_suite/testSuiteHandler.js");

testsFailed = testSuiteHandler.startTests();

if(testsFailed) {
    var clientServerOptions = {
        uri: SLACK_URI,
        body: "{\"text\": " + JSON.stringify(testsFailed) + "}",
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        }
    }
    request(clientServerOptions, function (error) {
        if(error) {
            //oh no the message didn't go through to Slack
            throw new Error("The message didn't go through to Slack!\n" + error);
        }
        console.log(clientServerOptions);
    });
}