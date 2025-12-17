const rwClient = require('../config/twitter');
const fs = require('fs');
const log = require('../utils/logger');
const { generateDevTip, generateDevJoke } = require('../config/ai');

// Status function
async function getBotStatus() {
  try {
    const me = await rwClient.v2.me();
    const tweets = await rwClient.v2.userTimeline(me.data.id, { max_results: 20, "tweet.fields": "public_metrics" });

    let totalLikes = 0, totalRetweets = 0, totalReplies = 0;

    if (tweets.data) {
      for (const tweet of tweets.data) {
        const metrics = tweet.public_metrics;
        totalLikes += metrics.like_count;
        totalRetweets += metrics.retweet_count;
        totalReplies += metrics.reply_count;
      }
    }

    return {
      active: true,
      totalTweets: tweets.data ? tweets.data.length : 0,
      likes: totalLikes,
      retweets: totalRetweets,
      replies: totalReplies,
      timestamp: new Date().toISOString()
    };

  } catch (err) {
    log('Error fetching bot status: ' + err.message);
    return { active: false, error: err.message };
  }
}

// DM tracking
const repliedDMsFile = './src/storage/repliedDMs.json';
let repliedDMs = fs.existsSync(repliedDMsFile) ? JSON.parse(fs.readFileSync(repliedDMsFile, 'utf8')) : {};

function randomDelay() {
  return Math.floor(Math.random() * (10000 - 3000 + 1)) + 3000;
}

async function checkDMs() {
  try {
    const events = await rwClient.v1.listDmEvents({ count: 5 });

    for (const event of events.events) {
      const id = event.id;
      const senderId = event.message_create.sender_id;
      const text = event.message_create.message_data.text.toLowerCase();

      if (repliedDMs[id] || senderId === process.env.BOT_USER_ID) continue;

      await new Promise(res => setTimeout(res, randomDelay()));

      let replyText = "";

      if (text.includes("joke")) {
        replyText = await generateDevJoke();
      } else if (text.includes("tip")) {
        replyText = await generateDevTip();
      } else if (text.includes("status")) {
        const status = await getBotStatus();
        replyText = `Bot Status Report:
Active: ${status.active}
Tweets: ${status.totalTweets}
Likes: ${status.likes}
Retweets: ${status.retweets}
Replies: ${status.replies}
Last Update: ${status.timestamp}`;
      } else {
        replyText = "Hello! DM me 'joke', 'tip', or 'status' to interact with me 🤖";
      }

      await rwClient.v1.sendDm({
        recipient_id: senderId,
        text: replyText
      });

      log(`Replied via DM to ${senderId}: "${text}"`);
      repliedDMs[id] = true;
    }

    fs.writeFileSync(repliedDMsFile, JSON.stringify(repliedDMs, null, 2));

  } catch (err) {
    log('Error checking DMs: ' + err.message);
    console.error(err);
  }
}

// Poll every 30 sec
setInterval(checkDMs, 30000);