// Load schedulers
require('./scheduler/tweetScheduler');
require('./scheduler/threadScheduler');

// Load interactions
require('./interactions/mentions');
// require('./interactions/dmChat'); // Disabled on Free plan (DMs require elevated access)

// First deploy post
//const firstRun = require('./scheduler/firstRun');
firstRun();

console.log("Dev Fun Bot is running...");
