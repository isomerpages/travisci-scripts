const fs = require("fs");
const checkYaml = require("./yaml/checkYaml.js");

module.exports = {
    runTest: function(filePath) {
        data = fs.readFileSync(filePath, "utf-8");
        
        //this is where we run our yaml tests
        returnObj = checkYaml.runTest(data, filePath);
        return returnObj;
    }
}