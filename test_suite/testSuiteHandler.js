//iterates through the project directory and runs
//the respective shell commands for each file

//full name of files/folders where checks are to be skipped
const ignores = ["README.md", "node_modules", "Readme.md", "readme.md"];

//should hidden files and directories (i.e. names
//beginning with '.') be checked?
const checkHiddens = false;

const fs = require("fs");
const markdownHandler = require("./markdownHandler.js");
const yamlHandler = require("./yamlHandler.js");
const request = require("request");

var errorMessage = "";
var fileCount = 0;
var errorCount = 0;

var permalinks = [];

//iterates through the root directory of the repo and
//runs the appropriate check for the file type
function readDirectory(path = ".") {
    files = fs.readdirSync(path, {"withFileTypes": true});

    files.forEach(function (file) {
        if(!checkHiddens && file.name.startsWith("."))
            return;
        for(var i = 0, len = ignores.length;i < len;i++) {
            if(file.name == ignores[i])
                return;
        }
        fullPath = path + "/" + file.name;
        if(file.isDirectory()) {
            readDirectory(fullPath);
        }
        else if(file.isFile()) {
            if(file.name.endsWith(".md")) {
                fileCount++;
                var checkResult = markdownHandler.runTest(fullPath, permalinks);
                if(checkResult.hasError) {
                    errorCount++;
                    errorMessage += checkResult.errorMessage;
                }
                permalinks = permalinks.concat(checkResult.permalinks);
            }

            if(file.name.endsWith(".yaml") || file.name.endsWith(".yml")) {
                fileCount++;
                var checkResult = yamlHandler.runTest(fullPath);
                if(checkResult.hasError) {
                    errorCount++;
                    errorMessage += checkResult.errorMessage;
                }
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
                        throw new Error("The message didn't go through to Slack!\n" + error);
                    }
                });
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
