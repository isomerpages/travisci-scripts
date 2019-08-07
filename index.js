const testSuiteHandler = require('./test_suite/testSuiteHandler.js');

module.exports = {
  testFiles(sendSlack = true) {
    testSuiteHandler.startTests(sendSlack);
    // other stuff to be handled by TravisCI as needed
  },
  runAll(sendSlack = true) {
    testSuiteHandler.startTests(sendSlack);
    setTimeout(testSuiteHandler.runLightHouse, 180000, sendSlack);
  },
  runLightHouse(sendSlack = true) {
    testSuiteHandler.runLightHouse(sendSlack);
  },
};
