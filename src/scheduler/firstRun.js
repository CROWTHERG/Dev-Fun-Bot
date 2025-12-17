// src/scheduler/firstRun.js
const rwClient = require('../config/twitter');
const tips = require('../content/tips');
const { generateDevTip, generateDevJoke } = require('../config/ai');
const log = require('../utils/logger');

async function firstRun() {
  try {
    // Choose a type: tip or joke
    const type = Math.random();
    let tweetContent;

    if (type < 0.5) tweetContent = await generateDevTip();
    else tweetContent = await generateDevJoke();

    // Post tweet
    const tweet = await rwClient.v2.tweet(tweetContent);
    log('First deploy tweet posted: ' + tweetContent);
    console.log('First deploy tweet ID:', tweet.data.id);

  } catch (err) {
    console.error('Error in first deploy tweet:', err);
  }
}

module.exports = firstRun;
