const dotenv = require("dotenv");
const OpenAI = require("openai");
const ExtractText = require("../services/extractText");
dotenv.config()
const Vacancy = require("../models/vacancy");

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



async function vacancyMatch(seekerPrompt){
  console.log(seekerPrompt);
  var vacancyData = await Vacancy.fetchAll();
  vacancyData = vacancyData.data;
  var prompt = `
      You are a vacancy matching system.  
    I will provide you with:  
    1. A list of job vacancies (with details such as title, company, location, work mode, description).  
    2. A seeker's request, which may include a job_url, job_title, company_name, or other criteria.  

    Your task:  
    - From the provided list of vacancies, return only those that matches the seeker's request.  
    - If the seeker provides a "job_url", match based on that vacancy's details.  
    - If the seeker provides a "job_title" (and optionally location, work mode, etc.), filter vacancies that align with those criteria.  
    - If the seeker provides a "company_name", return vacancies from that company.

    This is the seeker's prompt: """${JSON.stringify(seekerPrompt)}"""
    These are the vacancies: """${JSON.stringify(vacancyData)}"""


    - Always return the output in structured **JSON format** with this schema so that I can directly Parse it don't write any letter or 
    anything before the JSON. Just the json:

    {
      "matches": [
        {
          "job_title": "...",
          "company": "...",
          "location": "...",
          "mode_of_work": "...",
          "job_url": "...",
          "user_id": "..."
        }
      ]
    }

    If no vacancies match, return:
    { "matches": [] }
  `; 

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
  });

  const content = response.choices[0].message.content;
  try {
    return JSON.parse(content);
  } catch {
      console.log("Raw AI response:", content);
      return null;
    };

};



exports.vacancyMatch = vacancyMatch
exports.parseJobDetailsFromUrl = parseJobDetailsFromUrl
exports.parseJobDetails = parseJobDetails
