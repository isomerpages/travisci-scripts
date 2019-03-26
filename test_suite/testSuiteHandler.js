//iterates through the project directory and runs
//the respective shell commands for each file

//full name of files/folders where checks are to be skipped
const ignores = ["readme.md", "node_modules", "_site"];

//should hidden files and directories (i.e. names
//beginning with '.') be checked?
const checkHiddens = false;

const fs = require("fs");
const markdownHandler = require("./markdownHandler.js");
const yamlHandler = require("./yamlHandler.js");
const request = require("request");

let errorMessage = "";
let fileCount = 0;
let errorCount = 0;
let fatalErrorCount = 0;

let permalinks = [];

//iterates through the root directory of the repo and
//runs the appropriate check for the file type
function readDirectory(path = ".") {
    files = fs.readdirSync(path, {"withFileTypes": true});

    files.forEach(function (file) {
        if(!file.name) {
            console.log(file)
            return
        }
        if(!checkHiddens && file.name.startsWith("."))
            return;
        for(var i = 0, len = ignores.length;i < len;i++) {
            if(file.name.toLowerCase() == ignores[i])
                return;
        }
        fullPath = path + "/" + file.name;
        if(file.isDirectory()) {
            readDirectory(fullPath);
        }
        else if(file.isFile()) {
            //Markdown file checks MUST be synchronous because of the permalink checks
            if(file.name.endsWith(".md")) {
                fileCount++;
                var checkResult = markdownHandler.runTest(fullPath, permalinks);
                if(checkResult.hasError) {
                    errorCount++;
                    errorMessage += checkResult.errorMessage;
                }
                if(checkResult.hasFatalError) fatalErrorCount++;
                permalinks = permalinks.concat(checkResult.permalinks);
            }

            if(file.name.endsWith(".yaml") || file.name.endsWith(".yml")) {
                fileCount++;
                var checkResult = yamlHandler.runTest(fullPath);
                if(checkResult.hasError) {
                    errorCount++;
                    errorMessage += checkResult.errorMessage;
                }
                if(checkResult.hasFatalError) fatalErrorCount++;
            }
        }
    });
}

module.exports = {
    //starts the test suite
    //returns the string to be sent to Slack should there be errors
    //returns false otherwise (i.e. all files are good)
    startTests: function(sendSlack)
    {
        readDirectory();
        console.log("Number of files checked: " + fileCount);
        console.log("Number of files with errors: " + errorCount);
        errorOutput = "";
        if(errorCount == 1) {
            errorOutput = "Hey, this file doesn't look right:" + errorMessage;
        }
        else if(errorCount > 1) {
            errorOutput = "Hey, I've found errors in these " + errorCount + " files:" + errorMessage;
        }
        if(errorCount > 0) {
            console.log(errorOutput);

            //Encode the 3 characters we have to use HTML encoding for: &, <, and >
            //see: https://api.slack.com/docs/message-formatting
            errorOutput = errorOutput.replace(/&/g, "&amp;");
            errorOutput = errorOutput.replace(/</g, "&lt;");
            errorOutput = errorOutput.replace(/>/g, "&gt;");
            
            if(sendSlack) {
                const SLACK_URI = process.env.SLACK_URI;
                var clientServerOptions = {
                    uri: SLACK_URI,
                    body: "{\"text\": " + JSON.stringify(errorOutput) + "}",
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
                request(clientServerOptions, function (error) {
                    if(error) {
                        //oh no the message didn't go through to Slack
                        console.log("The message didn't go through to Slack!\n" + error);
                    }

                    if(fatalErrorCount > 0) {
                        //Fail the build here only after the Slack message is sent
                        throw new Error("Fatal error(s) were found! See above for details. Fatal errors must be rectified before merging to master is allowed.")
                    }
                });
            }
            else if(fatalErrorCount > 0) {
                //Fail the build here separately from Slack to avoid a case where this program
                //ceases execution before a Slack message is sent because we threw an error

                throw new Error("Fatal error(s) were found! See above for details. Fatal errors must be rectified before merging to master is allowed.")
            }
        }


        //reset variables we previously used
        errorMessage = "";
        fileCount = 0;
        errorCount = 0;
        permalinks = [];
        return;
    }
}
