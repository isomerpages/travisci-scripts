const testSuiteHandler = require('./test_suite/testSuiteHandler.js');

module.exports = {
  testFiles(sendSlack = true) {
    testSuiteHandler.startTests(sendSlack);
    // other stuff to be handled by TravisCI as needed
  },
  testAll(sendSlack = true) {
    testSuiteHandler.startTests(sendSlack);
  },
};
