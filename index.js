const testSuiteHandler = require("./test_suite/testSuiteHandler.js");

module.exports = {
    run: function() {
        testSuiteHandler.startTests();

        //other stuff to be handled by TravisCI as needed
    }
}