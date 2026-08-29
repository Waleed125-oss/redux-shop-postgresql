const OpenAI = require("openai");

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const generateProductContent = async ({
  productName,
  category,
  brand,
  details,
}, model 
) => {
  const prompt = `
You are an ecommerce product content generator.

Generate professional product information based ONLY on the information provided by the seller.

Product name:
${productName}

Category:
${category}

Brand:
${brand || "Not provided"}

Additional details:
${details || "Not provided"}

Return:
1. A professional product title.
2. A clear ecommerce product description.
3. A short description.
4. A list of important product features.

Do not invent technical specifications that were not provided.
Do not invent prices, ratings, stock quantities, guarantees, or certifications.

Return ONLY valid JSON using this structure:

{
  "title": "string",
  "shortDescription": "string",
  "description": "string",
  "features": [
    "string",
    "string",
    "string"
  ]
}
`;

  const response = await openrouter.chat.completions.create({
   model:
  model ||
  process.env.OPENROUTER_PRIMARY_MODEL ||
  "openrouter/free",

    messages: [
      {
        role: "system",
        content:
          "You generate accurate ecommerce product content.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],

    temperature: 0.7,
    response_format: {
      type: "json_object",
    },
  });

  const content =
    response.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("AI returned an empty response");
  }

  return content;
};

module.exports = {
  generateProductContent,
};