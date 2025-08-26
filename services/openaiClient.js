const dotenv = require("dotenv");
dotenv.config();

const OpenAI = require("openai");
const client = new OpenAI();

module.exports = client
