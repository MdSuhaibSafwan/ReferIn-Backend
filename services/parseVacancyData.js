const dotenv = require("dotenv");
const OpenAI = require("openai");
dotenv.config()

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function parseJobDetails(text) {
  const prompt = `
You are an assistant that extracts structured data from a job vacancy description.

Extract the following fields: ["job_title", "company_name", "country", "is_remote", "summary"].
Return output in JSON format ONLY.

Job description:
"""${text}"""
`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0, // deterministic extraction
  });

  // The AI response
  const content = response.choices[0].message.content;
  console.log("AI Response: ", content);
  try {
    return JSON.parse(content); // parsed as JSON
  } catch {
    console.log("Raw AI response:", content);
    return null;
  }
};

module.exports = parseJobDetails
