const cron = require('node-cron');
const rwClient = require('../config/twitter');
const tips = require('../content/tips');
const log = require('../utils/logger');

// Helper to post a thread
async function postThread(messages) {
  try {
    let previousId = null;
    for (const msg of messages) {
      const tweet = await rwClient.v2.tweet(
        msg,
        previousId ? { in_reply_to_tweet_id: previousId } : {}
      );
      previousId = tweet.data.id;

      // Log the tweet
      log('Thread tweet posted: ' + tweet.data.id);

      // Human-like delay between thread tweets (2–5 sec)
      await new Promise(res => setTimeout(res, Math.random() * 3000 + 2000));
    }
  } catch (err) {
    log('Error posting thread: ' + err.message);
    console.error(err);
  }
}

// Schedule a thread every day at 10 AM
cron.schedule('0 10 * * *', async () => {
  // Take 3 random tips for the thread
  const shuffledTips = tips.sort(() => 0.5 - Math.random());
  const threadTips = shuffledTips.slice(0, 3);
  await postThread(threadTips);
});