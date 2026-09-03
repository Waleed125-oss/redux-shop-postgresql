
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

import { fetchCategories } from "../../store/slices/categorySlice";
import { createProduct } from "../../store/slices/productSlice";

function AddProduct() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // =====================================================
  // AI DATA FROM SEPARATE AI PRODUCT PAGE
  // =====================================================

  const aiProduct = location.state?.aiProduct;
  const aiImageFromState = location.state?.aiImage;
  const aiDescription = location.state?.aiDescription;

  // =====================================================
  // CATEGORIES
  // =====================================================

  const { categories = [] } = useSelector(
    (state) => state.categories
  );

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // =====================================================
  // INITIAL DESCRIPTION
  // =====================================================

  const getInitialDescription = () => {
    if (!aiProduct) {
      return aiDescription || "";
    }

    let generatedDescription =
      aiProduct.description || aiDescription || "";

    if (
      Array.isArray(aiProduct.features) &&
      aiProduct.features.length > 0
    ) {
      generatedDescription +=
        "\n\nProduct Features:\n" +
        aiProduct.features
          .map((feature) => `• ${feature}`)
          .join("\n");
    }

    return generatedDescription;
  };

  // =====================================================
  // FORM STATE
  // =====================================================

  const [title, setTitle] = useState(
    aiProduct?.title || ""
  );

  const [brand, setBrand] = useState(
    aiProduct?.brand || ""
  );

  const [price, setPrice] = useState(
    aiProduct?.price || ""
  );

  const [description, setDescription] = useState(
    getInitialDescription
  );

  const [category_id, setCategoryId] = useState(
    aiProduct?.category_id ||
      aiProduct?.categoryId ||
      ""
  );

  const [rating, setRating] = useState(
    aiProduct?.rating || ""
  );

  const [stock, setStock] = useState("");

  const [image, setImage] = useState(null);

  const [galleryImages, setGalleryImages] = useState([]);

  const [aiImage, setAiImage] = useState(
    aiImageFromState || ""
  );

  const [error, setError] = useState("");

  // =====================================================
  // IMAGE HANDLERS
  // =====================================================

  const handleMainImage = (event) => {
    const selectedImage =
      event.target.files?.[0] || null;

    setImage(selectedImage);

    // Uploaded image takes priority over AI image
    if (selectedImage) {
      setAiImage("");
    }
  };

  const handleGalleryImages = (event) => {
    setGalleryImages(
      Array.from(event.target.files || [])
    );
  };

  // =====================================================
  // CONVERT AI BASE64 IMAGE TO FILE
  // =====================================================

  const dataUrlToFile = async (dataUrl, fileName) => {
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    return new File([blob], fileName, {
      type: blob.type || "image/jpeg",
    });
  };

  // =====================================================
  // SUBMIT PRODUCT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("brand", brand);
      formData.append("price", price);
      formData.append("description", description);
      formData.append("category_id", category_id);
      formData.append("rating", rating);
      formData.append("stock", stock);

      // =================================================
      // MAIN IMAGE
      // =================================================

      if (image) {
        formData.append("image", image);
      } else if (aiImage) {
        const aiFile = await dataUrlToFile(
          aiImage,
          "ai-product-image.jpg"
        );

        formData.append("image", aiFile);
      }

      // =================================================
      // GALLERY IMAGES
      // =================================================

      galleryImages.forEach((file) => {
        formData.append("images", file);
      });

      // =================================================
      // CREATE PRODUCT
      // =================================================

      await dispatch(createProduct(formData)).unwrap();

      // Reset form
      setTitle("");
      setBrand("");
      setPrice("");
      setDescription("");
      setCategoryId("");
      setRating("");
      setImage(null);
      setStock("");
      setGalleryImages([]);
      setAiImage("");


      navigate("/admin/products");
    } catch (error) {
      console.error("Failed to add product:", error);

      setError(
        error?.message || "Failed to add product."
      );
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div>
      {/* HEADER */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Add Product
        </h1>

        <p className="mt-2 text-gray-500">
          Add a new product to your store.
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl bg-white p-6 shadow"
      >
        {/* PRODUCT TITLE */}

        <div>
          <label className="mb-2 block font-medium">
            Product Title
          </label>

          <input
            type="text"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="Enter product title"
            className="w-full rounded-lg border px-4 py-3"
            required
          />
        </div>

        {/* BRAND */}

        <div>
          <label className="mb-2 block font-medium">
            Brand
          </label>

          <input
            type="text"
            value={brand}
            onChange={(event) =>
              setBrand(event.target.value)
            }
            placeholder="e.g. Apple, Samsung, Nike"
            className="w-full rounded-lg border px-4 py-3"
          />
        </div>

        {/* PRICE */}

        <div>
          <label className="mb-2 block font-medium">
            Price
          </label>

          <input
            type="number"
            value={price}
            onChange={(event) =>
              setPrice(event.target.value)
            }
            placeholder="Enter price"
            className="w-full rounded-lg border px-4 py-3"
            required
          />
        </div>


        {/* STOCK */}

<div>
  <label className="mb-2 block font-medium">
    Stock Quantity
  </label>

  <input
    type="number"
    min="0"
    step="1"
    value={stock}
    onChange={(event) =>
      setStock(event.target.value)
    }
    placeholder="Enter available quantity"
    className="w-full rounded-lg border px-4 py-3"
    required
  />

  <p className="mt-1 text-sm text-gray-500">
    Enter the number of units currently available.
  </p>
</div>

        {/* CATEGORY */}

        <div>
          <label className="mb-2 block font-medium">
            Category
          </label>

          <select
            value={category_id}
            onChange={(event) =>
              setCategoryId(event.target.value)
            }
            className="w-full rounded-lg border px-4 py-3"
            required
          >
            <option value="">
              Select Category
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* DESCRIPTION */}

        <div>
          <label className="mb-2 block font-medium">
            Description
          </label>

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Enter product description"
            rows="6"
            className="w-full rounded-lg border px-4 py-3"
            required
          />
        </div>

        {/* RATING */}

        <div>
          <label className="mb-2 block font-medium">
            Rating
          </label>

          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={rating}
            onChange={(event) =>
              setRating(event.target.value)
            }
            placeholder="Enter rating"
            className="w-full rounded-lg border px-4 py-3"
          />
        </div>

        {/* MAIN IMAGE */}

        <div>
          <label className="mb-2 block font-medium">
            Main Product Image
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handleMainImage}
            className="w-full rounded-lg border px-4 py-3"
          />

          {image && (
            <p className="mt-2 text-sm text-green-600">
              Uploaded image selected: {image.name}
            </p>
          )}
        </div>

        {/* AI IMAGE FROM AI PAGE */}

        {aiImage && (
          <div>
            <h3 className="mb-3 text-lg font-semibold">
              AI Generated Image
            </h3>

            <div className="rounded-xl border bg-gray-50 p-4">
              <img
                src={aiImage}
                alt="AI generated product"
                className="mx-auto h-80 w-full max-w-md rounded-lg object-contain"
              />
            </div>

            <p className="mt-2 text-sm text-green-600">
              This AI image will be used as the main
              product image.
            </p>
          </div>
        )}

        {/* GALLERY IMAGES */}

        <div>
          <label className="mb-2 block font-medium">
            Gallery Images
          </label>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryImages}
            className="w-full rounded-lg border px-4 py-3"
          />

          {galleryImages.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              {galleryImages.length} gallery image(s)
              selected.
            </p>
          )}
        </div>

        {/* SUBMIT */}

        <button
          type="submit"
          className="w-full rounded-lg bg-green-600 px-5 py-3 font-medium text-white hover:bg-green-700"
        >
          Create Product
        </button>
      </form>
    </div>
  );
}

export default AddProduct;