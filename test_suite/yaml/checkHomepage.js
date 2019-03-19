//runs the test for /_data/homepage.yml

const yaml = require("js-yaml");

module.exports = {
    runTest: function(data, filePath) {
        var returnObj = {
            hasError: false,
            hasFatalError: false,
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
        if(filePath.endsWith("homepage.yml") || filePath.endsWith("homepage.yaml")) {
            var fields = ["favicon", "agency-logo", "hero-title", "hero-subtitle", "hero-banner", "resources-title", "resources-subtitle", "resources-more-button", "resources-more-button-url"];
            for(i=0;i<fields.length;i++) {
                if(!data.hasOwnProperty(fields[i])) {
                    returnObj.errorMessage += errorHeader + "is missing a `" + fields[i] + ": ` field. We strongly recommend filling in all fields so that the user experience is as pleasant as possible"
                    returnObj.hasError = true;
                }
            }
            if(data.hasOwnProperty("button")) {
                if(!data.button[0].hasOwnProperty("text")) {
                    returnObj.errorMessage += errorHeader + "is missing a `text: ` field under `button:`. We strongly recommend filling in some text for the button. Remember to add 2 spaces in front of `text: `!";
                    returnObj.hasError = true;
                }
                if(!data.button[0].hasOwnProperty("url")) {
                    returnObj.errorMessage += errorHeader + "is missing a `url: ` field under `button:`. We strongly recommend filling in a URL for the button. Remember to add 2 spaces in front of `url: `!";
                    returnObj.hasError = true;
                }
            }
            if(data.hasOwnProperty("key-highlights")) {
                for(i=0;i<data["key-highlights"][0].length;i++) {
                    var highlightFields = ["title", "description", "url"];
                    for(j=0;j<highlightFields.length;j++) {
                        if(!data["key-highlights"][0].hasOwnProperty(highlightFields[j])) {
                            returnObj.errorMessage += errorHeader + "is missing a `" + highlightFields[j] + ": ` field under `key-highlights: `. We strongly recommend filling in all fields so that the user experience is as pleasant as possible"
                            returnObj.hasError = true;
                        }
                    }
                }
            }
        }        
        return returnObj;
    }
}