import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminAiProduct() {
  const navigate = useNavigate();

  const [description, setDescription] = useState("");
  const [generatedProduct, setGeneratedProduct] = useState(null);
  const [generatedImage, setGeneratedImage] = useState("");

  const [contentLoading, setContentLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const [error, setError] = useState("");

  // ========================================
  // GENERATE PRODUCT CONTENT
  // ========================================

  const handleGenerateContent = async () => {
    setError("");

    if (!description.trim()) {
      setError("Please describe the product first.");
      return;
    }

    setContentLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/ai/generate-product",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            description: description.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to generate product"
        );
      }

      if (!data.product) {
        throw new Error(
          "AI did not return product information."
        );
      }

      setGeneratedProduct(data.product);
    } catch (error) {
      console.error(
        "AI content generation error:",
        error
      );

      setError(
        error.message ||
          "Unable to generate product content."
      );
    } finally {
      setContentLoading(false);
    }
  };

  // ========================================
  // GENERATE PRODUCT IMAGE
  // ========================================

  const handleGenerateImage = async () => {
    setError("");

    if (!description.trim()) {
      setError("Please describe the product first.");
      return;
    }

    setImageLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/ai/generate-image",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productName:
              generatedProduct?.title || "",

            category:
              generatedProduct?.category || "",

            brand:
              generatedProduct?.brand || "",

            details: description.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to generate image"
        );
      }

      if (!data.image) {
        throw new Error(
          "AI did not return an image."
        );
      }

      const imageUrl = `data:${
        data.mimeType || "image/jpeg"
      };base64,${data.image}`;

      setGeneratedImage(imageUrl);
    } catch (error) {
      console.error(
        "AI image generation error:",
        error
      );

      setError(
        error.message ||
          "Unable to generate image."
      );
    } finally {
      setImageLoading(false);
    }
  };

  // ========================================
  // CONTINUE TO ADD PRODUCT
  // ========================================

  const handleContinue = () => {
    if (!generatedProduct && !generatedImage) {
      setError(
        "Generate product content or an image first."
      );
      return;
    }

    navigate("/admin/products/add", {
      state: {
        aiProduct: generatedProduct,
        aiImage: generatedImage,
        aiDescription: description,
      },
    });
  };

  // ========================================
  // UI
  // ========================================

  return (
    <div>
      {/* HEADER */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Create Product with AI
        </h1>

        <p className="mt-2 text-gray-500">
          Describe your product and let AI
          generate the product information for you.
        </p>
      </div>

      {/* MAIN CARD */}

      <div className="bg-white rounded-xl shadow p-6 space-y-6">

        {/* DESCRIPTION */}

        <div>
          <label className="block mb-2 font-medium text-gray-800">
            Describe Your Product
          </label>

          <textarea
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            placeholder="Example: Apple iPhone 15 Pro Max, 256GB, titanium body, 5G smartphone with a powerful camera and USB-C charging."
            rows="7"
            className="
              w-full
              border
              rounded-lg
              px-4
              py-3
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          />

          <p className="mt-2 text-sm text-gray-500">
            Give AI as much information as possible
            about the product. It will create the
            product title, description, features and
            other information.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {/* AI BUTTONS */}

        <div className="flex gap-4 flex-wrap">

          <button
            type="button"
            onClick={handleGenerateContent}
            disabled={
              contentLoading || imageLoading
            }
            className="
              px-6
              py-3
              bg-blue-600
              text-white
              rounded-lg
              hover:bg-blue-700
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {contentLoading
              ? "✨ Generating..."
              : "✨ Generate Content"}
          </button>

          <button
            type="button"
            onClick={handleGenerateImage}
            disabled={
              contentLoading || imageLoading
            }
            className="
              px-6
              py-3
              bg-purple-600
              text-white
              rounded-lg
              hover:bg-purple-700
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {imageLoading
              ? "🖼️ Generating..."
              : "🖼️ Generate Image"}
          </button>
        </div>

        {/* GENERATED CONTENT */}

        {generatedProduct && (
          <div className="border rounded-xl p-5 bg-gray-50">

            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Generated Product
            </h2>

            {generatedProduct.title && (
              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  Product Title
                </p>

                <p className="font-medium text-gray-800">
                  {generatedProduct.title}
                </p>
              </div>
            )}

            {generatedProduct.description && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">
                  Description
                </p>

                <p className="text-gray-700 whitespace-pre-line">
                  {generatedProduct.description}
                </p>
              </div>
            )}

            {generatedProduct.features?.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">
                  Features
                </p>

                <ul className="list-disc pl-5 text-gray-700">
                  {generatedProduct.features.map(
                    (feature, index) => (
                      <li key={index}>
                        {feature}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

          </div>
        )}

        {/* GENERATED IMAGE */}

        {generatedImage && (
          <div className="border rounded-xl p-5 bg-gray-50">

            <h2 className="text-xl font-semibold mb-4">
              Generated Product Image
            </h2>

            <img
              src={generatedImage}
              alt="AI generated product"
              className="
                w-full
                max-w-md
                h-80
                object-contain
                mx-auto
                rounded-lg
              "
            />

          </div>
        )}

        {/* ACTIONS */}

        <div className="flex gap-4 pt-4 border-t">

          <button
            type="button"
            onClick={() =>
              navigate("/admin/products")
            }
            className="
              px-5
              py-3
              border
              rounded-lg
              hover:bg-gray-50
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleContinue}
            disabled={
              !generatedProduct &&
              !generatedImage
            }
            className="
              px-6
              py-3
              bg-green-600
              text-white
              rounded-lg
              hover:bg-green-700
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            Continue to Add Product
          </button>

        </div>

      </div>
    </div>
  );
}

export default AdminAiProduct;