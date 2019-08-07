// Good luck Preston! (I'm sorry)
// If you are rewriting this, consider using a schema validation library
// such as yaml-schema-validator or yaml-validator, which makes your job
// a lot more easier (and also lets you delete all my functions here)
// I did not use these libraries as I could not find a suitable working
// library at this time
// Additional challenges when using a library is the collections key in
// _config.yml - its children name can be anything - and nothing out
// there supports running regex on key names. You can get around this by
// not checking for keys not defined in the schema, but you'll miss out on
// catching other genuine undefined keys

const yaml = require('js-yaml');
const { structure } = require('../../structures/yaml.js');

const returnObj = {
  hasError: false,
  hasFatalError: false,
  errorMessage: '',
};

function checkRequiredFields(structureDefinition, subject, chainString = '') {
  let returnErrors = [];

  if (!structureDefinition) return returnErrors;
  if (!subject) {
    // if blank subject, return all required elements
    for (let i = 0; i < structureDefinition.length; i += 1) {
      if (structureDefinition[i].required && structureDefinition[i].name.regex) {
        returnErrors.push(`${chainString}${structureDefinition[i].name.humanReadableName} is required`);
      } else if (structureDefinition[i].required) {
        returnErrors.push(`${chainString}${structureDefinition[i].name} is required`);
      }
    }
    return returnErrors;
  }
  if (Array.isArray(subject)) {
    subject.forEach((element) => {
      returnErrors = returnErrors.concat(
        checkRequiredFields(structureDefinition, element, chainString),
      );
    });
    return returnErrors;
  }

  for (let i = 0; i < structureDefinition.length; i += 1) {
    if (structureDefinition[i].required || typeof structureDefinition[i].requiredValue !== 'undefined') {
      if (typeof structureDefinition[i].name.regex !== 'undefined') {
        const regex = new RegExp(structureDefinition[i].name.regex, 'g');

        let present = false;

        const keys = Object.keys(subject);
        for (let j = 0; j < keys.length; j += 1) {
          if (regex.test(keys[j])) {
            present = true;
            if (typeof structureDefinition[i].requiredValue !== 'undefined'
              && structureDefinition[i].requiredValue !== subject[keys[j]]) {
              returnErrors.push(`\`${chainString}${structureDefinition[i].name.humanReadableName}\` must have a value of \`${structureDefinition[i].requiredValue}\`. Its current value is \`${subject[keys[j]]}\``);
            }
            break;
          }
        }

        if (structureDefinition[i].required && !present) {
          returnErrors.push(`\`${chainString}${structureDefinition[i].name.humanReadableName}\` is missing`);
        }
      } else if (structureDefinition[i].required && typeof subject[structureDefinition[i].name] === 'undefined') {
        returnErrors.push(`\`${chainString}${structureDefinition[i].name}\` is missing`);
      } else if (typeof structureDefinition[i].requiredValue !== 'undefined'
        && subject[structureDefinition[i].name] !== structureDefinition[i].requiredValue) {
        returnErrors.push(`\`${chainString}${structureDefinition[i].name}\` must have a value of \`${structureDefinition[i].requiredValue}\`. Its current value is \`${subject[structureDefinition[i].name]}\``);
      }
    }

    if (structureDefinition[i].children) {
      if (subject && structureDefinition[i].name.regex) {
        const regex = new RegExp(structureDefinition[i].name.regex, 'g');

        const keys = Object.keys(subject);
        for (let j = 0; j < keys.length; j += 1) {
          if (regex.test(keys[j])) {
            returnErrors = returnErrors.concat(
              checkRequiredFields(structureDefinition[i].children, subject[keys[j]], `${chainString}${keys[j]} > `),
            );
          }
        }
      } else {
        returnErrors = returnErrors.concat(
          checkRequiredFields(
            structureDefinition[i].children,
            subject[structureDefinition[i].name],
            `${chainString}${structureDefinition[i].name} > `,
          ),
        );
      }
    }
  }
  return returnErrors;
}

function checkForUndefined(structureDefinition, subject, chainString = '') {
  let returnErrors = [];

  if (!subject) {
    return returnErrors;
  }
  if (Array.isArray(subject)) {
    subject.forEach((element) => {
      returnErrors = returnErrors.concat(
        checkForUndefined(structureDefinition, element, chainString),
      );
    });
    return returnErrors;
  }

  const keys = Object.keys(subject);

  if (!structureDefinition) {
    if (typeof subject === 'object') {
      for (let i = 0; i < keys.length; i += 1) {
        returnErrors.push(`\`${chainString}${keys[i]}\` is an unknown configuration. Please check if you have made any spelling errors`);
      }
    }
    return returnErrors;
  }
  for (let i = 0; i < keys.length; i += 1) {
    // iterate through struct def to check for match
    let defined = false;

    for (let j = 0; j < structureDefinition.length; j += 1) {
      if (structureDefinition[j].name.regex) {
        const regex = new RegExp(structureDefinition[j].name.regex, 'g');
        if (regex.test(keys[i])) {
          // match found, check children if any and check the next field
          if (subject[keys[i]] && Object.keys(subject[keys[i]]).length > 0) {
            returnErrors = returnErrors.concat(
              checkForUndefined(structureDefinition[j].children, subject[keys[i]], `${chainString}${keys[i]} > `),
            );
          }
          defined = true;
          break;
        }
      } else if (keys[i] === structureDefinition[j].name) {
        // match found, check children if any and check the next field
        if (subject[keys[i]] && Object.keys(subject[keys[i]]).length > 0) {
          returnErrors = returnErrors.concat(
            checkForUndefined(structureDefinition[j].children, subject[keys[i]], `${chainString}${keys[i]} > `),
          );
        }
        defined = true;
        break;
      }
    }

    if (!defined) {
      returnErrors.push(`\`${chainString}${keys[i]}\` is an unknown configuration. Please check if you have made any spelling errors`);
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
