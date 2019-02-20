const fs = require("fs");

module.exports = {
    runTest: function(filePath) {
        data = fs.readFileSync(filePath, "utf-8");
        
        //this is where we run our yaml tests
        //as each yaml file is a singleton, they each have their own structure, and hence we are forced to
        //write a singleton test for each file. As a result, it does not cover all yaml files out there, and
        //it not be worth the effort to test for each file as well taking into account that the yaml files are
        //edited much less frequently

        var returnObj;
        
        if(filePath.endsWith("navigation.yml") || filePath.endsWith("navigation.yaml")) {
            const checkNavigation = require("./yaml/checkNavigation.js");
            returnObj = checkNavigation.runTest(data, filePath);
        }
        else if(filePath.endsWith("homepage.yml" || filePath.endsWith("homepage.yaml"))) {
            const checkHomepage = require("./yaml/checkHomepage.js");
            returnObj = checkHomepage.runTest(data, filePath);
        }
        else { //run the generic syntax test
            const checkYamlGeneric = require("./yaml/checkYamlGeneric.js");
            returnObj = checkYamlGeneric.runTest(data, filePath);
        }
        return returnObj;
    }
}