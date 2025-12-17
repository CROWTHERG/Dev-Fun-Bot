const cron = require('node-cron');
const rwClient = require('../config/twitter');
const tips = require('../content/tips');
const jokes = require('../content/jokes');
const promo = require('../content/promo');
const log = require('../utils/logger');
const { generateDevTip, generateDevJoke } = require('../config/ai');

// Helper function to pick a random item from array
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Schedule tweets every 3 hours
cron.schedule('0 */3 * * *', async () => {
  try {
    let type = Math.random();
    let tweet;

    // 40% chance tip, 20% joke, 20% promo, 20% AI content if available
    if (type < 0.4) {
      tweet = await generateDevTip?.() || randomItem(tips);
    } else if (type < 0.6) {
      tweet = await generateDevJoke?.() || randomItem(jokes);
    } else if (type < 0.8) {
      tweet = randomItem(promo);
    } else {
      // fallback random tip
      tweet = randomItem(tips);
    }

    // Post the tweet
    const posted = await rwClient.v2.tweet(tweet);

    // Log it
    log('Tweet posted: ' + posted.data.id + ' → ' + tweet);
  } catch (err) {
    log('Error posting tweet: ' + err.message);
    console.error(err);
  }
});