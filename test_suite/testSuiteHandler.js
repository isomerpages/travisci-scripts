//iterates through the project directory and runs
//the respective shell commands for each file

//full name of files/folders where checks are to be skipped
const ignores = ["README.md", "node_modules"];

//should hidden files and directories (i.e. names
//beginning with '.') be checked?
const checkHiddens = false;

const fs = require("fs");
const markdownHandler = require('./markdownHandler.js');

var errorMessage = "";
var fileCount = 0;
var errorCount = 0;

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
                var checkResult = markdownHandler.runTest(fullPath);
                if(checkResult) {
                    errorCount++;
                    errorMessage += checkResult;
                }
            }
        }
    });
}

module.exports = {
    //starts the test suite
    //returns the string to be sent to Slack should there be errors
    //returns false otherwise (i.e. all files are good)
    startTests: function()
    {
        readDirectory();
        console.log("Number of files checked: " + fileCount);
        console.log("Number of files with errors: " + errorCount);
        if(errorCount == 1) {
            errorOutput = "Hey, this file doesn't look right:" + errorMessage;
            console.log("Message to be sent to Slack:");
            console.log(errorOutput);
            return errorOutput;
        }
        else if(errorCount > 1) {
            errorOutput = "Hey, I've found errors in these " + errorCount + " files:" + errorMessage;
            console.log("Message to be sent to Slack:");
            console.log(errorOutput);
            return errorOutput;
        }
        else {
            return false;
        }
    }
}
