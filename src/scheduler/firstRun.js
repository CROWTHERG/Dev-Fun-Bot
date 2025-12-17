// src/scheduler/firstRun.js
const rwClient = require('../config/twitter');
const tips = require('../content/tips');
const jokes = require('../content/jokes');
const { generateDevTip, generateDevJoke } = require('../config/ai');
const log = require('../utils/logger');

async function firstRun() {
  let tweetContent;

  try {
    // Try OpenAI
    const type = Math.random();
    if (type < 0.5) tweetContent = await generateDevTip();
    else tweetContent = await generateDevJoke();

  } catch (err) {
    console.warn("OpenAI failed, using local content:", err.message);

    // Fallback to local content
    const type = Math.random();
    if (type < 0.5) tweetContent = tips[Math.floor(Math.random() * tips.length)];
    else tweetContent = jokes[Math.floor(Math.random() * jokes.length)];
  }

  try {
    const tweet = await rwClient.v2.tweet(tweetContent);
    log('First deploy tweet posted: ' + tweetContent);
    console.log('First deploy tweet ID:', tweet.data.id);
  } catch (err) {
    console.error('Error posting first tweet:', err);
  }
}

module.exports = firstRun;
