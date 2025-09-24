const { AzureOpenAI } = require("openai");

const initializeOpenAIClient = () => {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

  if (!endpoint || !apiKey || !deployment) {
    throw new Error("Azure OpenAI configuration missing in environment variables");
  }

  return new AzureOpenAI({
    endpoint,
    apiKey,
    apiVersion,
    deployment,
  });
};

module.exports = {
  initializeOpenAIClient,
}; 