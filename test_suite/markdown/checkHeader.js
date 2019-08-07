const grayMatter = require('gray-matter');
const { compareStructures } = require('../yaml/compareStructures.js');
const { structure } = require('../../structures/markdown.js');

// a list of non-URL safe characters taken from
// https://stackoverflow.com/a/695467
// the slash character (/) is excluded since it is used
// properly to specify the directory in the URL
const unsafeChars = ['&', '$', '+', ',', ':', ';', '=', '?', '@', '#', '<', '>', '[', ']', '{', '}', '|', '\\', '^', '%'];

module.exports = {
  // the home page (index.md) is a type 0 page
  // type 1 pages are those under a left_nav
  // type 2 pages are resource room pages
  // type 3 pages are those by themselves (e.g. privacy.md and includes misc/search.md)
  // type 4 pages have layout: 'contact_us'
  runTest(data, type, filePath, permalinks) {
    const returnObj = {
      permalinks: [],
      hasError: false,
      hasFatalError: false,
      errorMessage: '',
    };

    const errorHeader = `\n\`${filePath.substring(1)}\` `;

    // first we run this regex to split data line by line
    const lines = data.split(/(?:\r\n|\r|\n)/g);

    // make sure there are 2 sets of triple dashes before passing the file into gray-matter

    // make sure that there are 3 dashes at the start
    let hasStartDashes = true;
    if (lines[0].trimEnd() !== '---') {
      returnObj.errorMessage += `${errorHeader}needs to have exactly 3 dashes (\`---\`) at the start. Make sure this is there, and that the headers like layout and title are on a new line.`;
      returnObj.hasError = true;
      hasStartDashes = false;
    }

    let hasEndDashes = false;
    for (let lineNumber = 1; lineNumber < lines.length; lineNumber += 1) {
      if (lines[lineNumber].trimEnd() === '---') {
        hasEndDashes = true;
        break;
      }
    }

    if (hasStartDashes && hasEndDashes) {
      // if it has both sets of dashes we can now safely pump the data into gray-matter
      let frontMatter;
      try {
        frontMatter = grayMatter(data);
      } catch (e) {
        returnObj.errorMessage += `${errorHeader}\n\`\`\`${e.message}\n\`\`\``;
        returnObj.hasError = true;
        return returnObj;
      }

      // at this point:
      // 1) there are no duplicated fields
      // 2) the front matter has been loaded as an object under frontMatter.data

      // now we check for missing fields (and invalid data under these fields)

      const errorMessageArray = compareStructures(structure[type], frontMatter.data);

      if (Object.prototype.hasOwnProperty.call(frontMatter.data, 'permalink')) {
        // make sure the permalink is valid, and not duplicated
        const permalink = frontMatter.data.permalink.replace(/"/g, '');
        for (let j = 0; j < permalinks.length; j += 1) {
          if (permalink === permalinks[j].link) {
            returnObj.errorMessage += `${errorHeader}has the same permalink as \`${permalinks[j].filePath}\`. Please change the permalink in either one of the files so that both pages can be properly accessed`;
            returnObj.hasError = true;
          }
        }

        for (let j = 0; j < unsafeChars.length; j += 1) {
          if (permalink.includes(unsafeChars[j])) {
            returnObj.errorMessage += `${errorHeader}has the \`${unsafeChars[j]}\` character in its \`permalink: \` field. This character is unsafe for use in URLs. Please remove this character, replace it with a dash (\`-\`), or replace it with english text (e.g. \`-and-\` instead of \`&\`)`;
            returnObj.hasError = true;
          }
        }

        returnObj.permalinks.push({
          link: permalink,
          filePath: filePath.substring(1),
        });
      } else if (Object.prototype.hasOwnProperty.call(frontMatter.data, 'file_url')) {
        // Removes "https://", "http://", or "ftp://" at the front of file_url, if present
        const [, , fileUrl] = /^(https:\/\/|http:\/\/|ftp:\/\/|)(.*)/i.exec(frontMatter.data.file_url);
        for (let j = 0; j < unsafeChars.length; j += 1) {
          if (fileUrl.includes(unsafeChars[j])) {
            returnObj.errorMessage += `${errorHeader}has the \`${unsafeChars[j]}\` character in its \`file_url: \` field. This character is unsafe for use in URLs. Please remove this character, replace it with a dash (\`-\`), or replace it with english text (e.g. \`-and-\` instead of \`&\`)`;
            returnObj.hasError = true;
          }
        }
      }

      // dates are needed for resource room pages only we
      // check this field a bit differently because it can
      // be done by having the date in the file name too
      if (type === 2) {
        // TODO: instead of frontMatter.data.date.length < 1, check for proper date formats
        if (!Object.prototype.hasOwnProperty.call(frontMatter.data, 'date') || frontMatter.data.date == null || frontMatter.data.date.length < 1) {
          // check whether the date is in the file name
          // if it isn't, then we spit the date not found error
          if (!/\/\d\d\d\d-\d\d-\d\d-.*\.md/.test(filePath)) {
            returnObj.errorMessage += `${errorHeader}is missing the date in the file name. The file should be named in the format \`YYYY-MM-DD-filename.md\`, e.g. \`2019-08-09-national-day.md\``;
            returnObj.hasError = true;
          }
        }
      }

      if (errorMessageArray.length > 0) {
        returnObj.hasError = true;
        errorMessageArray.forEach((errorMessage) => {
          returnObj.errorMessage += `${errorHeader}- front matter: ${errorMessage}`;
        });
      }
    } else if (!hasEndDashes) {
      // if it does not have ending dashes we (angrily) complain to the user
      returnObj.errorMessage += `${errorHeader}needs to have exactly 3 dashes (\`---\`) after all the headers (e.g. layout and title), on a new line.`;
      returnObj.hasError = true;
    }

    return returnObj;
  },
};
