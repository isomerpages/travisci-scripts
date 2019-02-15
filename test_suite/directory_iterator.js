//iterates through the project directory and runs
//the respective shell commands for each file

//full name of files where checks are to be skipped
const ignores = ["README.md", "node_modules"];

//should hidden files and directories (i.e. names
//beginning with '.') be checked?
const checkHiddens = false;

const fs = require("fs");
const checkTripleDash = require('./checkTripleDash.js');
const request = require("request");
const SLACK_URI = process.env.SLACK_URI;

var errorMessages = [];
var fileCount = 0;
var errorCount = 0;

//checks that each markdown page starts with "---"
function readDirectory(path = ".") {
    files = fs.readdirSync(path, {"withFileTypes": true});
    files.forEach(function (file) {
        if(!checkHiddens && file.name.startsWith(".") || file.name == "node_modules")
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
                var checkResult = checkTripleDash.hasError(fullPath);
                if(checkResult) {
                    errorCount++;
                    console.log(fullPath, "does not have exactly 3 dashes!");
                    errorMessages.push(checkResult);
                }
            }
        }
    });
}

//console.log("{");
//console.log('"files": [');
readDirectory();
//console.log("],");
//console.log('"offense_count": ' + errorCount);
//console.log("}");
console.log("Number of files checked: " + fileCount);
console.log("Number of bad files: " + errorCount);
if(errorCount > 0) {
    errorMessage = "Hey, I've found some errors:";
    for(var i=0, len=errorMessages.length;i<len;i++) {
        errorMessage += "\n" + errorMessages[i];
    }
    var clientServerOptions = {
        uri: SLACK_URI,
        body: "{\"text\":\"" + errorMessage +"\"}",
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        }
    }
    request(clientServerOptions, function (error, response) {
        console.log(error, response.body, errorMessage, clientServerOptions["body"]);
    })
}
