const {
  generateProductContent,
} = require("./openrouterService");

// ================= AI MODELS =================

const getModels = () => {
  const primary =
    process.env.OPENROUTER_PRIMARY_MODEL ||
    "openrouter/free";

  const fallbackModels =
    process.env.OPENROUTER_FALLBACK_MODELS
      ? process.env.OPENROUTER_FALLBACK_MODELS
          .split(",")
          .map((model) => model.trim())
          .filter(Boolean)
      : [];

  return [
    primary,
    ...fallbackModels,
  ];
};

// ================= GENERATE =================

const generateWithFallback = async (
  productData
) => {
  const models = getModels();

  let lastError = null;

  for (const model of models) {
    try {
      console.log(
        `🤖 Trying AI model: ${model}`
      );

      const result =
        await generateProductContent(
          productData,
          model
        );

      console.log(
        `✅ AI model succeeded: ${model}`
      );

      return {
        content: result,
        model,
      };

    } catch (error) {
      lastError = error;

      console.error(
        `❌ AI model failed: ${model}`
      );

      console.error(error.message);

      console.log(
        "➡️ Trying next AI model..."
      );
    }
  }

  throw (
    lastError ||
    new Error("All AI models failed")
  );
};

module.exports = {
  generateWithFallback,
};