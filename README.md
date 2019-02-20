# Isomer TravisCI Scripts

This package contains a set of scripts that facilitates the production and deployment of [Isomer](https://isomer.gov.sg/) pages using TravisCI.

Specifically, it checks for syntax errors in the Markdown and YAML files used by Isomer, and sends details of the errors to a designated Slack channel using a [webhook](https://api.slack.com/incoming-webhooks). On commit or merge to the master branch (i.e. to production), it also waits for the [Netlify](https://app.netlify.com/) build process to complete and purges the KeyCDN cache to ensure that all visitors will receive the latest copy of the site.

## Isomer Integration

First, install [this package](https://www.npmjs.com/package/@liyicheng/isomerpages-travisci-scripts) as a dependency to your site repository:

```bash
npm install @liyicheng/isomerpages-travisci-scripts
```

Follow [Slack's instructions](https://api.slack.com/incoming-webhooks) for creating an app with a webhook for the channel you want the script to send error messages to. Add this webhook address to your TravisCI environment as the `SLACK_URI` environmental variable. Add the `KEYCDN_API_KEY` and `KEYCDN_ZONE_ID` environmental variables as well. **Make sure all these environmental variables are hidden!**

Create the file `.travis.yml` in the root directory of your repository:

```yaml
#.travis.yml
language: node_js
node_js:
  - "node"
git:
  depth: 3
script: node travis-script.js
cache: npm
```

Create the file `travis-script.js` in the root directory of your site repository:

```js
//travis-script.js
const travisScript = require("@liyicheng/isomerpages-travisci-scripts");
const travisBranch = process.env.TRAVIS_BRANCH;

if(travisBranch == "master") {
    travisScript.runAll();
}
else {
    travisScript.testsOnly();
}
```

Feel free to customise `travis-script.js` as you please. See below for a more complete documentation of the methods in the package.

This is all you need to get started! Give yourself a pat on the back, sit back, and let Slack handle the rest!

## Methods

### runAll

`runAll()` is a method that optionally takes in the boolean parameter `sendSlack`, which defaults to `true` if left unspecified.

If `sendSlack` is set to `false`, the error output will not be sent to Slack. However, you can continue to see the output generated in the TravisCI build log.

`runAll()` will run both the Isomer syntax checker and the CDN purger. It should be run when commits/merges are made in the `master` branch.

It does not return any value - all output is sent to standard output and Slack (if enabled).

### testsOnly

`testsOnly()` is a method that optionally takes in the boolean parameter `sendSlack`, which defaults to `true` if left unspecified.

If `sendSlack` is set to `false`, the error output will not be sent to Slack. However, you can continue to see the output generated in the TravisCI build log.

As its name implies, `testsOnly()` will only run the Isomer syntax checker. It should be run for commits on staging branches.

It does not return any value - all output is sent to standard output and Slack (if enabled).

### purgeCacheOnly

`purgeCacheOnly()` is a method that does not take in any parameters. It only runs the CDN cache purger, skipping the Isomer syntax checker.

It does not return any value - all output is sent to standard output and Slack (if enabled).
