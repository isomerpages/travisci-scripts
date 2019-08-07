const fs = require('fs');
const yaml = require('js-yaml');
const { compareStructures } = require('./yaml/compareStructures.js');
const { structure } = require('../structures/yaml.js');

module.exports = {
  runTest(filePath, fileName) {
    const data = fs.readFileSync(filePath, 'utf-8');

    const returnObj = {
      hasError: false,
      hasFatalError: false,
      errorMessage: '',
    };

    const errorHeader = `\n\`${filePath.substring(1)}\`:`;
    let yamlData;

    // turns the yaml string into a javascript object
    try {
      yamlData = yaml.safeLoad(data);
    } catch (e) {
      // yaml.safeload() throws an exception if there are YAML syntax errors,
      // e.g. 2 attributes with the same name
      // we will just output the syntax error details and quit checking
      console.error(e);
      returnObj.errorMessage += `${errorHeader}\n\`\`\`${e.message}\n\`\`\``;
      returnObj.hasError = true;
      return returnObj; // no point continuing if the data isn't properly loaded
    }

    // find and load structure definitions
    let fileNameWithoutExtension = '';
    const fileNameArray = fileName.split('.');
    for (let i = 0; i < fileNameArray.length - 1; i += 1) {
      if (i !== 0) fileNameWithoutExtension += '.';
      fileNameWithoutExtension += fileNameArray[i];
    }

    if (structure[fileNameWithoutExtension]) {
      const errorMessageArray = compareStructures(structure[fileNameWithoutExtension], yamlData);

      if (errorMessageArray.length > 0) {
        returnObj.hasError = true;
        errorMessageArray.forEach((errorMessage) => {
          returnObj.errorMessage += `${errorHeader} ${errorMessage}`;
        });
      }
    }

    return returnObj;
  },
};
