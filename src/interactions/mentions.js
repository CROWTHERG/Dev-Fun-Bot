const rwClient = require('../config/twitter');
const fs = require('fs');
const path = require('path');
const log = require('../utils/logger');

const repliedFile = path.join(__dirname, '../storage/replied.json');
let replied = JSON.parse(fs.readFileSync(repliedFile, 'utf8'));

// Human-like random delay (30–120 sec)
function randomDelay() {
  return Math.floor(Math.random() * (120000 - 30000 + 1)) + 30000;
}

// Reply message (customize)
const replyMessage = "Thanks for reaching out! DM me or check my pinned thread 👨‍💻";

// Check mentions AND comments
async function checkMentionsAndComments() {
  try {
    // 1️⃣ Handle mentions
    const mentions = await rwClient.v2.mentionsTimeline({ max_results: 5 });
    if (mentions.data) {
      for (const mention of mentions.data) {
        const id = mention.id;
        const username = mention.author_id;
        const text = mention.text.toLowerCase();

        if (replied[id]) continue;

        if (text.includes('help') || text.includes('how') || text.includes('?')) {
          await new Promise(res => setTimeout(res, randomDelay()));
          await rwClient.v2.reply(replyMessage, id);
          log(`Replied to mention: ${username} | Tweet ID: ${id}`);
          replied[id] = true;
        }
      }
    }

    // 2️⃣ Handle comments on your tweets
    const myUser = await rwClient.v2.me();
    const myTweets = await rwClient.v2.userTimeline(myUser.data.id, { max_results: 5 });

    if (myTweets.data) {
      for (const tweet of myTweets.data) {
        const conversationId = tweet.id;

        // Fetch replies to this tweet
        const replies = await rwClient.v2.search(`conversation_id:${conversationId} -from:${myUser.data.username}`, { max_results: 5 });
        if (!replies.data) continue;

        for (const reply of replies.data) {
          const id = reply.id;
          const username = reply.author_id;
          const text = reply.text.toLowerCase();

          if (replied[id]) continue;

          if (text.includes('help') || text.includes('how') || text.includes('?')) {
            await new Promise(res => setTimeout(res, randomDelay()));
            await rwClient.v2.reply(replyMessage, id);
            log(`Replied to comment: ${username} | Tweet ID: ${id}`);
            replied[id] = true;
          }
        }
      }
    }

    // Save replied JSON
    fs.writeFileSync(repliedFile, JSON.stringify(replied, null, 2));
  } catch (err) {
    log('Error checking mentions/comments: ' + err.message);
    console.error(err);
  }
}

// Run every 10 minutes
setInterval(checkMentionsAndComments, 10 * 60 * 1000);