const CLOUDFLARE_URL =
  `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell`;

const generateProductImage = async ({
  productName,
  category,
  brand,
  details,
}) => {
  const prompt = `
Professional e-commerce product photograph.

Product: ${productName}
Category: ${category || "general product"}
Brand: ${brand || "generic"}
Details: ${details || "high quality product"}

Requirements:
- realistic commercial product photography
- clean white studio background
- product centered
- product clearly visible
- realistic lighting
- sharp details
- premium e-commerce catalog style
- no people
- no text
- no watermark
- no logo added by the AI
`;

  const response = await fetch(CLOUDFLARE_URL, {
    method: "POST",

    headers: {
      Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      prompt,
      steps: 4,
     
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    console.error("Cloudflare Image Error:", data);

    throw new Error(
      data.errors?.[0]?.message ||
      "Cloudflare image generation failed"
    );
  }

  if (!data.result?.image) {
    throw new Error("Cloudflare did not return an image");
  }

  return {
    image: data.result.image,
    mimeType: "image/jpeg",
  };
};

module.exports = {
  generateProductImage,
};