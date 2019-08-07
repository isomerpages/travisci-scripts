const fs = require('fs');
const yaml = require('js-yaml');

let resourceRoomName = false;
try {
  resourceRoomName = yaml.safeLoad(fs.readFileSync('./_config.yml')).resources_name;
} catch (e) {
  resourceRoomName = false; // assume no resource room
}

const checkHeader = require('./markdown/checkHeader.js');
const checkMarkdown = require('./markdown/checkMarkdown.js');

module.exports = {
  runTest(filePath, permalinks) {
    const data = fs.readFileSync(filePath, 'utf-8');

    // find out what type of page it is
    // the home page (index.md) is a type 1 page
    // type 2 pages are those under a left_nav
    // type 3 pages are resource room pages
    // type 4 pages are those by themselves (e.g. privacy.md and includes misc/search.md)
    let type = 3;
    if (filePath === './index.md') type = 0;
    else if (filePath.startsWith('./_')) type = 1;
    else if (resourceRoomName && filePath.toLowerCase().startsWith(`./${resourceRoomName}/`)) type = 2;

    // this is the part where we run our suite of markdown tests

    const returnObj = checkHeader.runTest(data, type, filePath, permalinks);

    const checkMarkdownResult = checkMarkdown.runTest(data, filePath);
    if (checkMarkdownResult.hasError) {
      returnObj.hasError = true;
      returnObj.errorMessage += checkMarkdownResult.errorMessage;

      if (checkMarkdownResult.hasFatalError) returnObj.hasFatalError = true;
    }
    return returnObj;
  },
};
