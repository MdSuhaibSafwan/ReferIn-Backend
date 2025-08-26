const OpenAI = require("openai");

// Initialize client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // make sure you set your key in env
});

async function createAssistants() {
  try {
    // 1. Seeker Assistant
    const seekerAssistant = await client.beta.assistants.create({
      name: "Seeker Assistant",
      instructions: `
        You are the Seeker Assistant. Your role is:
        - Accept a CV (if provided), otherwise set CV data as null.
        - Accept one or more of the following input fields: "job_url", "job_title", "company_name".
        - Validate inputs: at least one of these fields must be provided.
        - Call the function "getReferers" to fetch potential referers from the database.
        - Based on matches, return the best referer data so the seeker can connect with them on LinkedIn.
        - Results must be in JSON array format.
        `,
      model: "gpt-4.1",
      tools: [
        {
          type: "function",
          function: {
            name: "getReferers",
            description: "Fetch referer details from the database",
            parameters: {
              type: "object",
              properties: {
                job_url: { type: "string", description: "Job posting URL if provided" },
                job_title: { type: "string", description: "Title of the job if provided" },
                company_name: { type: "string", description: "Company name if provided" },
                cv_data: { type: "string", description: "Extracted CV data if available, otherwise null" }
              },
              required: [],
            },
          },
        },
      ],
    });

    console.log("✅ Seeker Assistant created with ID:", seekerAssistant.id);

    // 2. Job Matching Assistant
    const jobMatchingAssistant = await client.beta.assistants.create({
      name: "Job Matching Assistant",
      instructions: `
        You are the Job Matching Assistant. Your role is:
        - Accept one or more of the following input fields: "job_url", "job_title", "company_name".
        - Validate inputs: at least one of these fields must be provided.
        - Call the function "getReferers" to fetch referer data from the database.
        - Filter results based on referer's expertise and relevance to the provided job field.
        - Return a clean, structured response of referers who best match the criteria.
        - If no matches are found, return an empty array.
        - Results must be in JSON array format.
        `,
      model: "gpt-4.1",
      tools: [
        {
          type: "function",
          function: {
            name: "getReferers",
            description: "Fetch referer details from the database",
            parameters: {
              type: "object",
              properties: {
                job_url: { type: "string", description: "Job posting URL if provided" },
                job_title: { type: "string", description: "Title of the job if provided" },
                company_name: { type: "string", description: "Company name if provided" }
              },
              required: [],
            },
          },
        },
      ],
    });

    console.log("✅ Job Matching Assistant created with ID:", jobMatchingAssistant.id);

  } catch (err) {
    console.error("❌ Error creating assistants:", err);
  }
}

module.exports = createAssistants;
