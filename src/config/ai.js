const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateDevJoke() {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: "Write a short funny developer joke in one tweet." }],
    max_tokens: 50,
  });
  return response.choices[0].message.content.trim();
}

async function generateDevTip() {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: "Write a short helpful programming tip in one tweet." }],
    max_tokens: 50,
  });
  return response.choices[0].message.content.trim();
}

module.exports = { generateDevJoke, generateDevTip };