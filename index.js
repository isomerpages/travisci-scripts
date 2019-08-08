const testSuiteHandler = require('./test_suite/testSuiteHandler.js');

module.exports = {
  testFiles(sendSlack = true) {
    testSuiteHandler.startTests(sendSlack);
  },
  runAll(sendSlack = true) {
    testSuiteHandler.startTests(sendSlack);
    setTimeout(testSuiteHandler.runLightHouse, 180000, sendSlack);
  },
  runLighthouse(sendSlack = true) {
    testSuiteHandler.runLightHouse(sendSlack);
  },
};
