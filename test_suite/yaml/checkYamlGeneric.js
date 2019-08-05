// runs the test for /_data/navigation.yml

const yaml = require('js-yaml');
const { structure } = require('../../structures/yaml.js');

const returnObj = {
  hasError: false,
  hasFatalError: false,
  errorMessage: '',
};

function checkRequiredFields(structureDefinition, subject) {
  let returnErrors = [];

  if (!structureDefinition) return returnErrors;
  if (!subject) {
    // if blank subject, return all required elements
    for (let i = 0; i < structureDefinition.length; i += 1) {
      if (structureDefinition[i].required && structureDefinition[i].name.regex) {
        returnErrors.push(`${structureDefinition[i].name.humanReadableName} is required`);
      } else if (structureDefinition[i].required) {
        returnErrors.push(`${structureDefinition[i].name} is required`);
      }
    }
    return returnErrors;
  }

  for (let i = 0; i < structureDefinition.length; i += 1) {
    if (structureDefinition[i].required) {
      // console.log(structureDefinition[i].name, 'struct def name');
      // console.log(subject, 'subject');
      if (structureDefinition[i].name.regex) {
        const regex = new RegExp(structureDefinition[i].name.regex, 'g');

        let present = false;

        const keys = Object.keys(subject);
        for (let j = 0; j < keys.length; j += 1) {
          if (regex.test(keys[j])) {
            present = true;
            break;
          }
        }

        if (!present) {
          returnErrors.push(`${structureDefinition[i].name.humanReadableName} is required`);
        }
      } else if (!subject[structureDefinition[i].name]) {
        returnErrors.push(`${structureDefinition[i].name} is required`);
      }
    }

    if (structureDefinition[i].children) {
      if (structureDefinition[i].name.regex) {
        const regex = new RegExp(structureDefinition[i].name.regex, 'g');

        const keys = Object.keys(subject);
        for (let j = 0; j < keys.length; j += 1) {
          if (regex.test(keys[j])) {
            returnErrors = returnErrors.concat(
              checkRequiredFields(structureDefinition[i].children, subject[keys[j]]),
            );
          }
        }
      } else {
        returnErrors = returnErrors.concat(
          checkRequiredFields(
            structureDefinition[i].children,
            subject[structureDefinition[i].name],
          ),
        );
      }
    }
  }

  return returnErrors;
}

function compareStructures(structureDefinition, subject) {
  // run 1 pass through definition, making sure that whatever is required is present
  // then run 1 pass through subject, making sure that the stuff in there is as defined
  console.log(checkRequiredFields(structureDefinition, subject));
}

module.exports = {
  runTest(data, filePath, fileName) {
    // turns the yaml string into a javascript object
    let yamlData;
    try {
      yamlData = yaml.safeLoad(require('fs').readFileSync('../isomerpages-govtech/_config.yml', 'utf8'));
    } catch (e) {
      // yaml.safeload() throws an exception if there are YAML syntax errors,
      // e.g. 2 attributes with the same name
      // we will just output the syntax error details and quit checking
      console.error(e);
      // returnObj.errorMessage += `${errorHeader}\n\`\`\`\n${e.message}\n\`\`\``;
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
      compareStructures(structure[fileNameWithoutExtension], yamlData);
    }

    return returnObj;
  },
};
