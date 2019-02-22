const fs = require("fs");

//i know this is a frankenstein line of code but trust me it should work
//1 it reads the file /_data/homepage.yml
//2 the data in the file is loaded as a js object using the js-yaml library
//3 it pulls the value for resources-more-button-url
//4 it runs the regex on the value to get e.g. "desiredtext" in "desiredtext/junk/?morejunk"
//5 it turns the desired text to lower case
try {
    var resourceRoomName = require("js-yaml").safeLoad(fs.readFileSync("./_config.yml"))["resources_name"].replace(/"/g, "").toLowerCase();
}
catch(e) {
    resourceRoomName = false; //assume no resource room
}
//enable this line instead if you prefer to not get resourceRoomName automatically or if the above line is not working
//const resourceRoomName = "news";

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
        else if(resourceRoomName && filePath.startsWith("./"+resourceRoomName+"/"))
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