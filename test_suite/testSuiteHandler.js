// iterates through the project directory and runs
// the respective shell commands for each file

// full name of files/folders where checks are to be skipped
const ignores = ['readme.md', 'node_modules', '_site', '.travis.yml'];

// should hidden files and directories (i.e. names
// beginning with '.') be checked?
const checkHiddens = false;

const fs = require('fs');
const markdownHandler = require('./markdownHandler.js');
const yamlHandler = require('./yamlHandler.js');
const { runLightHouse } = require('./lighthouseHandler');
const { sendSlackMessage } = require('../sendSlack');

let errorMessage = '';
let fileCount = 0;
let errorCount = 0;
let fatalErrorCount = 0;

let permalinks = [];

// iterates through the root directory of the repo and
// runs the appropriate check for the file type
function readDirectory(path = '.') {
  const files = fs.readdirSync(path, { withFileTypes: true });

  files.forEach((file) => {
    if (!file.name) {
      console.log(file);
      return;
    }
    if (!checkHiddens && file.name.startsWith('.')) return;
    for (let i = 0, len = ignores.length; i < len; i += 1) {
      if (file.name.toLowerCase() === ignores[i]) return;
    }
    const fullPath = `${path}/${file.name}`;
    if (file.isDirectory()) {
      readDirectory(fullPath);
    } else if (file.isFile()) {
      // Markdown file checks MUST be synchronous because of the permalink checks
      if (file.name.endsWith('.md')) {
        fileCount += 1;
        const checkResult = markdownHandler.runTest(fullPath, permalinks);
        if (checkResult.hasError) {
          errorCount += 1;
          errorMessage += checkResult.errorMessage;
        }
        if (checkResult.hasFatalError) fatalErrorCount += 1;
        permalinks = permalinks.concat(checkResult.permalinks);
      }

      if (file.name.endsWith('.yaml') || file.name.endsWith('.yml')) {
        fileCount += 1;
        const checkResult = yamlHandler.runTest(fullPath, file.name);
        if (checkResult.hasError) {
          errorCount += 1;
          errorMessage += checkResult.errorMessage;
        }
        if (checkResult.hasFatalError) fatalErrorCount += 1;
      }
    }
  });
}

module.exports = {
  // starts the test suite
  // returns the string to be sent to Slack should there be errors
  // returns false otherwise (i.e. all files are good)
  startTests(sendSlack) {
    readDirectory();
    console.log(`Number of files checked: ${fileCount}`);
    console.log(`Number of files with errors: ${errorCount}`);

    const travisBranch = process.env.TRAVIS_BRANCH;
    let errorOutput = '';

    if (errorCount === 1) {
      errorOutput = `An error was found in \`${travisBranch === 'master' ? process.env.PROD_URL : process.env.STAGING_URL}\`:${errorMessage}`;
    } else if (errorCount > 1) {
      errorOutput = `These errors were found in \`${travisBranch === 'master' ? process.env.PROD_URL : process.env.STAGING_URL}\`:${errorMessage}`;
    }
    if (errorCount > 0) {
      console.log(errorOutput);
      if (sendSlack) sendSlackMessage(errorOutput);
      if (fatalErrorCount > 0) {
        // Fail the build here separately from Slack to avoid a case where this program
        // ceases execution before a Slack message is sent because we threw an error
        sendSlackMessage(errorOutput, true);
        console.error('Fatal error(s) were found! See above for details. Fatal errors must be rectified before merging to master is allowed.');
        process.exitCode = 1;
      }
    }

    // reset variables we previously used
    errorMessage = '';
    fileCount = 0;
    errorCount = 0;
    permalinks = [];
  },
  runLightHouse(sendSlack) {
    if (process.env.PROD_URL && process.env.TRAVIS_BRANCH === 'master') runLightHouse(process.env.PROD_URL, sendSlack);
    else if (process.env.STAGING_URL) runLightHouse(process.env.STAGING_URL, sendSlack);
  },
};
