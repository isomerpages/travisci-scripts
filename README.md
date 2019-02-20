# Isomer TravisCI Scripts

**THIS README IS STILL A WIP. DO NOT FOLLOW YET.**

This package contains a set of scripts that facilitates the production and deployment of [Isomer](https://isomer.gov.sg/) pages using TravisCI (or any other CI platform). Specifically, it checks for syntax errors in the Markdown and YAML files used by Isomer, and sends details of the errors to a designated Slack channel using a [webhook](https://api.slack.com/incoming-webhooks). On commit or merge to the master branch (i.e. to production), it also waits for the [Netlify](https://app.netlify.com/) build process to complete and purges the KeyCDN cache to ensure that all visitors will receive the latest copy of the site.

## Quick Isomer Integration

First, install this package as a dependency to your site repository:

```shell
npm install @liyicheng/isomerpages-travisci-scripts
```

On your Slack API management page, create a new webhook for your desired channel for the project. Add this webhook address to your TravisCI environment as the `SLACK_URI` environmental variable. Remember to keep it hidden!

Remember to add the `KEYCDN_API_KEY` and `KEYCDN_ZONE_ID` (secret) environmental variables as well. 

Add the file `travis-master.js`, which will be run on each commit/merge to the `master` branch:

```javascript
//travis-master.js
const travisScript = require("@liyicheng/isomerpages-travisci-scripts");

travisScript.runAll();
```

Add the file `travis-check.js`, which will be run on each commit to other branches:

```javascript
const travisScript = require("@liyicheng/isomerpages-travisci-scripts");

travisScript.testsOnly();
```

**TODO**
