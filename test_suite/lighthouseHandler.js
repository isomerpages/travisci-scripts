const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const { sendSlackMessage } = require('../sendSlack');

function launchChromeAndRunLighthouse(url, opts, config = null) {
  return chromeLauncher.launch({ chromeFlags: opts.chromeFlags }).then((chrome) => {
    const opts2 = opts;
    opts2.port = chrome.port;
    return lighthouse(url, opts2, config).then(results => chrome.kill().then(() => results));
  });
}

const opts = {
  chromeFlags: ['--headless', '--no-sandbox'],
};

async function runLightHouse(url, sendSlack) {
  console.log('Lighthouse tests starting...');
  let hasVulnerability = false;
  try {
    const results = await launchChromeAndRunLighthouse(url, opts);
    // Check for presence of vulnerable libraries
    if (results.lhr.audits['no-vulnerable-libraries'].score < 1) {
      let vulnText = `The following vulnerable libraries were found at ${url}:`;
      results.lhr.audits['no-vulnerable-libraries'].details.items.forEach((vuln) => {
        vulnText += `\n${vuln.highestSeverity} severity: ${vuln.vulnCount} vulnerabilities found in ${vuln.detectedLib.text} (${vuln.detectedLib.url})`;
      });
      console.log(vulnText);
      hasVulnerability = true;
      if (sendSlack) {
        sendSlackMessage(vulnText);
        sendSlackMessage(vulnText, true);
      }
    }
    // Print a score summary
    console.log(`\nLighthouse Score Summary for ${url}`);
    console.log(`Lighthouse Score Summary for ${url}`.replace(/./g, '='));
    console.log(`Peformance: ${results.lhr.categories.performance.score * 100}/100`);
    console.log(`Accessibility: ${results.lhr.categories.accessibility.score * 100}/100`);
    console.log(`Best Practices: ${results.lhr.categories['best-practices'].score * 100}/100`);
    console.log(`SEO: ${results.lhr.categories.seo.score * 100}/100`);
  } catch (e) {
    console.log(e);
  }
  if (hasVulnerability) throw new Error('Fatal error(s) were found! See above for details. Fatal errors must be rectified before merging to master is allowed.');
}

module.exports = { runLightHouse };
