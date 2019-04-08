const request = require('request');

const { SLACK_URI } = process.env;

function sendSlackMessage(message) {
  let encodedMessage = message;

  // Encode the 3 characters we have to use HTML encoding for: &, <, and >
  // see: https://api.slack.com/docs/message-formatting
  encodedMessage = encodedMessage.replace(/&/g, '&amp;');
  encodedMessage = encodedMessage.replace(/</g, '&lt;');
  encodedMessage = encodedMessage.replace(/>/g, '&gt;');

  const clientServerOptions = {
    uri: SLACK_URI,
    body: `{"text": ${JSON.stringify(encodedMessage)}}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  request(clientServerOptions, (error) => {
    if (error) {
      // oh no the message didn't go through to Slack
      console.log(`The message didn't go through to Slack!\n${error}`);
    }
  });
}

module.exports = { sendSlackMessage };
