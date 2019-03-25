const testSuiteHandler = require("./test_suite/testSuiteHandler.js");
const axios = require('axios');
const request = require("request");

// purgeCacheIfDeployed runs when code is successfully merged to the master branch.
// The function runs a while loop to check if the Netlify website has been successfully deployed.
// If so, the function breaks out of the loop and makes an API call to purge the CDN cache.

module.exports = {
    runAll: function(sendSlack = true) {
        purgeCacheIfDeployed(sendSlack);
        testSuiteHandler.startTests(sendSlack);
        //other stuff to be handled by TravisCI as needed
        return;
    },
    testsOnly: function(sendSlack = true) {
        testSuiteHandler.startTests(sendSlack);
    },
    purgeCacheOnly: purgeCacheIfDeployed
}

function timeOutAlert(sendSlack) {
  const errorMessage = 'The latest build did not deploy successfully for 10 minutes! The build most likely has failed.'
  console.log(errorMessage)

  if(sendSlack) {
    const SLACK_URI = process.env.SLACK_URI;
    var clientServerOptions = {
        uri: SLACK_URI,
        body: "{\"text\": " + JSON.stringify(errorMessage) + "}",
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        }
    }
    request(clientServerOptions, function (error) {
        if(error) {
            //oh no the message didn't go through to Slack
            console.log("The message didn't go through to Slack!\n" + error);
        }
    });
  }
}

async function purgeCacheIfDeployed(sendSlack = true) {
  try {
    console.log('In purgeCacheIfDeployed')
    let deploySuccess = false

    // Timeout if build has not succeeded for 10min
    const timeOut = setTimeout(timeOutAlert, 600000, sendSlack)

    while (!deploySuccess) {
      deploySuccess = await checkDeployState()
    }

    clearTimeout(timeOut)

    let purgeSuccess = false 
    while (!purgeSuccess) {
      purgeSuccess = await purgeCache()  
    }
  } catch (err) {
    console.log(err)
  }
}

async function checkDeployState() {
  try {
    let NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID
    let NETLIFY_ACCESS_TOKEN = process.env.NETLIFY_ACCESS_TOKEN

    console.log('Checking if site has been deployed successfully')
    let resp = await axios.get(`https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}/deploys?access_token=${NETLIFY_ACCESS_TOKEN}`)

    let latestDeployStatus = resp.data[0].state
    if (latestDeployStatus === "ready") {
      console.log('Site ' + NETLIFY_SITE_ID + ' has been successfully deployed')
      return true
    }
    console.log('Site ' + NETLIFY_SITE_ID + ' has not been deployed')
    return false
  } catch (err) {
    console.log(err)
  }
}

async function purgeCache() {
  try {
    let KEYCDN_API_KEY = process.env.KEYCDN_API_KEY
    let KEYCDN_ZONE_ID = process.env.KEYCDN_ZONE_ID

    console.log('Purging cache')
    let resp = await axios.get(`https://${KEYCDN_API_KEY}@api.keycdn.com/zones/purge/${KEYCDN_ZONE_ID}.json`)
    if (resp.status === 200) {
      console.log('CDN cache has been successfully purged for KEYCDN Zone ID:' + KEYCDN_ZONE_ID)
      return true
    }
    console.log('Failed to purge CDN cache for KEYCDN Zone ID:' + KEYCDN_ZONE_ID)
    return false
  } catch (err) {
    console.log(err)
  }
}