// runs the test for /_data/navigation.yml
// Good luck Preston! (I'm sorry)

const yaml = require('js-yaml');
const { structure } = require('../../structures/yaml.js');

const returnObj = {
  hasError: false,
  hasFatalError: false,
  errorMessage: '',
};

let callCount = 0;

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
    if (structureDefinition[i].required || typeof structureDefinition[i].requiredValue !== 'undefined') {
      // console.log(structureDefinition[i].name, 'struct def name');
      // console.log(subject, 'subject');
      if (typeof structureDefinition[i].name.regex !== 'undefined') {
        const regex = new RegExp(structureDefinition[i].name.regex, 'g');

        let present = false;

        const keys = Object.keys(subject);
        for (let j = 0; j < keys.length; j += 1) {
          if (regex.test(keys[j])) {
            present = true;
            if (typeof structureDefinition[i].requiredValue !== 'undefined'
            && structureDefinition[i].requiredValue !== subject[keys[j]]) {
              returnErrors.push(`${structureDefinition[i].name.humanReadableName} must have a value of ${structureDefinition[i].requiredValue}`);
            }
            break;
          }
        }

        if (structureDefinition[i].required && !present) {
          returnErrors.push(`${structureDefinition[i].name.humanReadableName} is required`);
        }
      } else if (structureDefinition[i].required && typeof subject[structureDefinition[i].name] === 'undefined') {
        returnErrors.push(`${structureDefinition[i].name} is required`);
      } else if (typeof structureDefinition[i].requiredValue !== 'undefined'
        && subject[structureDefinition[i].name] !== structureDefinition[i].requiredValue) {
        returnErrors.push(`${structureDefinition[i].name} must have a value of ${structureDefinition[i].requiredValue}`);
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

function checkForUndefined(structureDefinition, subject) {
  callCount += 1;
  let returnErrors = [];

  if (!subject) {
    return returnErrors;
  }
  if (Array.isArray(subject)) {
    subject.forEach((element) => {
      const test = checkForUndefined(structureDefinition, element);
      returnErrors = returnErrors.concat(test);
    });
    return returnErrors;
  }

  const keys = Object.keys(subject);

  if (!structureDefinition) {
    if (callCount === 1) console.log('it\'s one!');
    if (typeof subject === 'object') {
      for (let i = 0; i < keys.length; i += 1) {
        returnErrors.push(`${keys[i]} is undefined`);
      }
    }
    return returnErrors;
  }
  for (let i = 0; i < keys.length; i += 1) {
    // iterate through struct def to check for match
    let defined = false;

    for (let j = 0; j < structureDefinition.length; j += 1) {
      // console.log(structureDefinition[j].name, keys[i], keys[i] === structureDefinition[j].name);
      if (structureDefinition[j].name.regex) {
        const regex = new RegExp(structureDefinition[j].name.regex, 'g');
        if (regex.test(keys[i])) {
          // match found, check children if any and check the next field
          if (Object.keys(subject[keys[i]]).length > 0) {
            returnErrors = returnErrors.concat(
              checkForUndefined(structureDefinition[j].children, subject[keys[i]]),
            );
          }
          defined = true;
          break;
        }
      } else if (keys[i] === structureDefinition[j].name) {
        // match found, check children if any and check the next field
        if (Object.keys(subject[keys[i]]).length > 0) {
          returnErrors = returnErrors.concat(
            checkForUndefined(structureDefinition[j].children, subject[keys[i]]),
          );
        }
        defined = true;
        break;
      }
    }

    if (!defined) {
      returnErrors.push(`${keys[i]} is undefined`);
    }
  }
  return returnErrors;
}

function compareStructures(structureDefinition, subject) {
  // run 1 pass through definition, check that required fields are there, and required values match
  // then run 1 pass through subject, making sure that there are no undefined fields
  const returnErrors = checkRequiredFields(structureDefinition, subject);
  return returnErrors.concat(checkForUndefined(structureDefinition, subject));
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
      console.log(compareStructures(structure[fileNameWithoutExtension], yamlData));
    }

    return returnObj;
  },
};
