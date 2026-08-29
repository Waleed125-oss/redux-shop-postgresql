// const { generateWithFallback } = require("../services/ai/aiFallbackService");
// const {
//   generateProductImage,
// } = require("../services/ai/cloudflareImageService");

// const generateProduct = async (req, res) => {
//   try {
//     const {
//       productName,
//       category,
//       brand,
//       details,
//     } = req.body;

//     if (!productName || productName.trim() === "") {
//       return res.status(400).json({
//         message: "Product name is required",
//       });
//     }

//     if (!category || category.trim() === "") {
//       return res.status(400).json({
//         message: "Category is required",
//       });
//     }

//     const aiResult = await generateWithFallback({
//       productName: productName.trim(),
//       category: category.trim(),
//       brand: brand?.trim() || "",
//       details: details?.trim() || "",
//     });

//     const aiResponse = aiResult.content;

//     let product;

//     try {
//       let cleanResponse = aiResponse.trim();

//       cleanResponse = cleanResponse
//         .replace(/^```json\s*/i, "")
//         .replace(/^```\s*/i, "")
//         .replace(/\s*```$/i, "")
//         .trim();

//       product = JSON.parse(cleanResponse);

//     } catch (parseError) {
//       console.error(
//         "AI JSON parsing error:",
//         parseError
//       );

//       console.error(
//         "Raw AI response:",
//         aiResponse
//       );

//       return res.status(502).json({
//         message:
//           "AI returned an invalid response. Please try again.",
//       });
//     }

//     res.json({
//       success: true,
//       product,
//     });

//   } catch (error) {
//     console.error(
//       "Generate product AI error:",
//       error
//     );

//     res.status(500).json({
//       message:
//         "Unable to generate product content",
//     });
//   }
// };


// const generateImage = async (req, res) => {
//   try {
//     const {
//       productName,
//       category,
//       brand,
//       details,
//     } = req.body;

//     if (!productName || productName.trim() === "") {
//       return res.status(400).json({
//         message: "Product name is required",
//       });
//     }

//     const result = await generateProductImage({
//       productName: productName.trim(),
//       category: category?.trim() || "",
//       brand: brand?.trim() || "",
//       details: details?.trim() || "",
//     });

//     // Convert Base64 into a React-compatible data URL
//     const imageUrl =
//       `data:${result.mimeType};base64,${result.image}`;

//     return res.status(200).json({
//       success: true,
//       image: result.image,
//       mimeType: result.mimeType,
//       imageUrl,
//     });

//   } catch (error) {
//     console.error(
//       "AI image generation error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message:
//         error.message ||
//         "Failed to generate product image",
//     });
//   }
// };


// module.exports = {
//   generateProduct,
//   generateImage,
// };





















const {
  generateWithFallback,
} = require("../services/ai/aiFallbackService");

const {
  generateProductImage,
} = require("../services/ai/cloudflareImageService");

// ========================================
// GENERATE PRODUCT CONTENT
// ========================================

const generateProduct = async (req, res) => {
  try {
    const { description } = req.body;

    // ======================================
    // VALIDATE DESCRIPTION
    // ======================================

    if (
      !description ||
      description.trim() === ""
    ) {
      return res.status(400).json({
        message:
          "Product description is required",
      });
    }

    // ======================================
    // SEND DESCRIPTION TO AI
    // ======================================

    const aiResult =
      await generateWithFallback({
        productName: "",
        category: "",
        brand: "",
        details: description.trim(),
      });

    const aiResponse =
      aiResult.content;

    // ======================================
    // PARSE AI RESPONSE
    // ======================================

    let product;

    try {
      let cleanResponse =
        aiResponse.trim();

      // Remove markdown JSON fences
      cleanResponse =
        cleanResponse
          .replace(
            /^```json\s*/i,
            ""
          )
          .replace(
            /^```\s*/i,
            ""
          )
          .replace(
            /\s*```$/i,
            ""
          )
          .trim();

      product =
        JSON.parse(cleanResponse);

    } catch (parseError) {
      console.error(
        "AI JSON parsing error:",
        parseError
      );

      console.error(
        "Raw AI response:",
        aiResponse
      );

      return res.status(502).json({
        message:
          "AI returned an invalid response. Please try again.",
      });
    }

    // ======================================
    // RETURN GENERATED PRODUCT
    // ======================================

    return res.status(200).json({
      success: true,
      product,
    });

  } catch (error) {

    console.error(
      "Generate product AI error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to generate product content",
    });
  }
};


// ========================================
// GENERATE PRODUCT IMAGE
// ========================================

const generateImage = async (req, res) => {
  try {

    const {
      description,
      productName,
      category,
      brand,
      details,
    } = req.body;

    // ======================================
    // USE DESCRIPTION AS PRIMARY INPUT
    // ======================================

    const imageDescription =
      description?.trim() ||
      details?.trim() ||
      "";

    if (!imageDescription) {
      return res.status(400).json({
        message:
          "Product description is required",
      });
    }

    // ======================================
    // GENERATE IMAGE
    // ======================================

    const result =
      await generateProductImage({
        productName:
          productName?.trim() || "",

        category:
          category?.trim() || "",

        brand:
          brand?.trim() || "",

        details:
          imageDescription,
      });

    // ======================================
    // CREATE DATA URL
    // ======================================

    const imageUrl =
      `data:${result.mimeType};base64,${result.image}`;

    // ======================================
    // RETURN IMAGE
    // ======================================

    return res.status(200).json({
      success: true,
      image: result.image,
      mimeType: result.mimeType,
      imageUrl,
    });

  } catch (error) {

    console.error(
      "AI image generation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to generate product image",
    });
  }
};


// ========================================
// EXPORT
// ========================================

module.exports = {
  generateProduct,
  generateImage,
};