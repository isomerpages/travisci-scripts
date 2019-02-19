const resourceRoomName = "news";

const fs = require("fs");
const checkHeader = require("./markdown/checkHeader.js");
const checkMarkdown = require("./markdown/checkMarkdown.js");

module.exports = {
    runTest: function(filePath, permalinks) {
        data = fs.readFileSync(filePath, "utf-8");
        
        //find out what type of page it is
        //the home page (index.md) is a type 1 page
        //type 2 pages are those under a left_nav
        //type 3 pages are resource room pages
        //type 4 pages are those by themselves (e.g. privacy.md and includes misc/search.md)
        var type = 4;
        if(filePath == "./index.md")
            type = 1;
        else if(filePath.startsWith("./_"))
            type = 2;
        else if(filePath.startsWith("./"+resourceRoomName+"/"))
            type = 3;
        
        //this is the part where we run our suite of markdown tests

        returnObj = checkHeader.runTest(data, type, filePath, permalinks);

        checkMarkdownResult = checkMarkdown.runTest(data, type, filePath);
        if(checkMarkdownResult.hasError) {
            returnObj.hasError = true;
            returnObj.errorMessage += checkMarkdownResult.errorMessage;
        }
        return returnObj;
    }
}