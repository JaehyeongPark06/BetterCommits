const { CohereClient } = require("cohere-ai");

const cohere = new CohereClient({
  apiKey: process.env.COHERE_API_KEY,
});

// initialize some cohere api key, we could ask user to input it when they first use the extension
// for now just hardcode in .env

async function analyzeCommitMessage(message: string): Promise<string> {
  const response = await cohere.chat({
    model: "command",
    message: `Analyze the following git commit message and provide feedback on its clarity, structure, and adherence to best practices. The default commit template you should refer to is the popular angular commit template. The user's git commit message is:\n\n${message}\n\nFeedback:`,
  });

  console.log(response); // debug
  return response.body.generations[0].text.trim();
}
