const dotenv = require("dotenv");
const OpenAI = require("openai");
const ExtractText = require("../services/extractText");
dotenv.config()

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function parseJobDetails(text) {
  const prompt = `
You are an assistant that extracts structured data from a job vacancy description.

Extract the following fields: ["job_title", "company_name", "country", "is_remote", "summary"].
Return output in JSON format ONLY. If you cannot extract a field, set the value to null.

Example output:
{
  "job_title": "Software Engineer",
  "company_name": "Google",
  "country": "USA",
  "is_remote": true,
  "summary": "We are looking for a skilled software engineer to join our team."
}

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


async function parseJobDetailsFromUrl(url) {
  const text = await ExtractText.extractTextFromUrl(url);

  const prompt = `
You are an assistant that extracts structured data from a job vacancy description.

Extract the following fields: ["job_title", "company_name", "country", "is_remote", "summary"].
Return output in JSON format ONLY. If you cannot extract a field, set the value to null.

Example output:
{
  "job_title": "Software Engineer",
  "company_name": "Google",
  "country": "USA",
  "is_remote": true,
  "summary": "We are looking for a skilled software engineer to join our team."
}

Job description:
"""${text}"""
`;
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
  });

  const content = response.choices[0].message.content;
  console.log("AI Response:", content);
  try {
    return JSON.parse(content);
  } catch {
      console.log("Raw AI response:", content);
      return null;
    };
  };


exports.parseJobDetailsFromUrl = parseJobDetailsFromUrl
exports.parseJobDetails = parseJobDetails
