# Isomer TravisCI Scripts

This package contains a set of scripts that facilitates the production and deployment of [Isomer](https://isomer.gov.sg/) pages using TravisCI.

Specifically, it checks for syntax errors in the Markdown and YAML files used by Isomer, and sends details of the errors to a designated Slack channel using a [webhook](https://api.slack.com/incoming-webhooks).

## Isomer Integration

First, install [this package](https://www.npmjs.com/package/@isomerpages/isomerpages-travisci-scripts) as a dependency:

```bash
npm install @isomerpages/isomerpages-travisci-scripts
```

Follow [Slack's instructions](https://api.slack.com/incoming-webhooks) for creating an app with a webhook for the channel you want the script to send error messages to. Add this webhook address to your TravisCI environment as the `SLACK_URI` environmental variable. Add the `SLACK_ALERT_URI`, `STAGING_URL`, and `PROD_URL` environmental variables as well.

**Make sure all secret key environmental variables are hidden!**

Create the file `.travis.yml` in the root directory of your site's repository:

```yaml
#.travis.yml
git:
  depth: 3

matrix:
  include:
    - language: ruby
      dist: trusty
      script:
        - bundle exec jekyll build
      cache: bundler

    - language: node_js
      dist: trusty
      node_js: "node"
      script: node travis-script.js
      cache: npm
      addons:
        chrome: stable
```

Create the file `travis-script.js` in the root directory of your site's repository:

```js
//travis-script.js
const travisScript = require("@isomerpages/isomerpages-travisci-scripts");
travisScript.runAll();
```

Feel free to customise `travis-script.js` as you please. See below for a more complete documentation of the methods in the package.

This is all you need to get started! Give yourself a pat on the back, sit back, and let Slack handle the rest!

## Methods

### runAll

`runAll()` is a method that optionally takes in the boolean parameter `sendSlack`, which defaults to `true` if left unspecified.

If `sendSlack` is set to `false`, the error output will not be sent to Slack. However, you can continue to see the output generated in the TravisCI build log.

`runAll()` will run both the Isomer syntax checker and the Lighthouse scan. The Lighthouse scan will scan the production site if the branch as detected by TravisCI is `master`, and it will scan the staging site otherwise. The Lighthouse scan will only begin after 3 minutes in order to give Netlify and KeyCDN time to build and cache the new site.

It does not return any value - all output is sent to standard output and Slack (if enabled).

### testFiles

`testFiles()` is a method that optionally takes in the boolean parameter `sendSlack`, which defaults to `true` if left unspecified.

If `sendSlack` is set to `false`, the error output will not be sent to Slack. However, you can continue to see the output generated in the TravisCI build log.

`testFiles()` will only run the Isomer syntax checker.

Running `testFiles(false)` is also a great way to preview the error output locally to fix any preexisting issues before deploying it on a site's repository. You don't want to suddenly send a barrage of error messages to the user's Slack channel!

It does not return any value - all output is sent to standard output and Slack (if enabled).

### runLightHouse

`runLighthouse()` is a method that optionally takes in the boolean parameter `sendSlack`, which defaults to `true` if left unspecified. It only runs the Lighthouse scan, skipping the Isomer syntax checker. Additionally, there is no pause/timeout before the scan starts. In other words, the scan is run once the method is called.

It does not return any value - all output is sent to standard output and Slack (if enabled).
