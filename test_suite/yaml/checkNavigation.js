//runs the test for /_data/navigation.yml

const yaml = require("js-yaml");

module.exports = {
    runTest: function(data, filePath) {
        var returnObj = {
            hasError: false,
            errorMessage: ""
        }

        const errorHeader = "\n`" + filePath.substring(1) + "` ";

        //turns the yaml string into a javascript object
        try {
            data = yaml.safeLoad(data);
        }
        catch(e) {
            //yaml.safeload() throws an exception if there are YAML syntax errors, e.g. 2 attributes with the same name
            //we will just output the syntax error details and quit checking
            console.error(e);
            returnObj.errorMessage += errorHeader + e.message;
            returnObj.hasError = true;
            return returnObj; //no point continuing if the data isn't properly loaded
        }

        //for safety we check the file name again
        if(filePath.endsWith("navigation.yml") || filePath.endsWith("navigation.yaml")) {
            for(i=0;i<data.length;i++) {
                var numSuffix = "th";
                    if((i+1) % 10 == 1)
                        numSuffix = "st";
                    if((i+1) % 10 == 2)
                        numSuffix = "nd";
                    if((i+1) % 10 == 3)
                        numSuffix == "rd";
                if(!data[i].hasOwnProperty("title")) {
                    returnObj.errorMessage += errorHeader + "is missing a `title: ` field in the *" + (i+1) + numSuffix + " set* of URLs";
                    returnObj.hasError = true;
                }
                if(!data[i].hasOwnProperty("url")) {
                    returnObj.errorMessage += errorHeader + "is missing a `url: ` field in the *" + (i+1) + numSuffix + " set* of URLs";
                    returnObj.hasError = true;
                }
                if(data[i].hasOwnProperty("sub-links")) {
                    for(j=0;j<data[i]["sub-links"].length;j++) {
                        if(!data[i]["sub-links"][j].hasOwnProperty("title")) {
                            returnObj.errorMessage += errorHeader + "is missing a `title: ` field in the `sub-links:` section of the *" + (i+1) + numSuffix + " set* of URLs";
                            returnObj.hasError = true;
                        }
                        if(!data[i]["sub-links"][j].hasOwnProperty("url")) {
                            returnObj.errorMessage += errorHeader + "is missing a `url: ` field in the `sub-links:` section of the *" + (i+1) + numSuffix + " set* of URLs";
                            returnObj.hasError = true;
                        }
                    }
                }
            }
        }
        return returnObj;
    }
}