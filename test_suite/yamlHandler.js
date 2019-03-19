const fs = require("fs");

module.exports = {
    runTest: function(filePath) {
        data = fs.readFileSync(filePath, "utf-8");
        
        //this is where we run our yaml tests
        //as each yaml file is a singleton, they each have their own structure, and hence we are forced to
        //write a singleton test for each file. As a result, it does not cover all yaml files out there, and
        //it not be worth the effort to test for each file as well taking into account that the yaml files are
        //edited much less frequently

        let returnObj;
        
        if(filePath.toLowerCase().endsWith("navigation.yml") || filePath.toLowerCase().endsWith("navigation.yaml")) {
            returnObj = require("./yaml/checkNavigation.js").runTest(data, filePath);
        }
        else if(filePath.toLowerCase().endsWith("homepage.yml" || filePath.toLowerCase().endsWith("homepage.yaml"))) {
            returnObj = require("./yaml/checkHomepage.js").runTest(data, filePath);
        }
        else { //run the generic syntax test
            returnObj = require("./yaml/checkYamlGeneric.js").runTest(data, filePath);
        }
        return returnObj;
    }
}