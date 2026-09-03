

import { useState, useEffect } from "react";
import { fetchCategoriesAPI } from "../../services/api";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

import { createSellerProduct } from "../../store/slices/sellerSlice";

function SellerAddProduct() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // ========================================
  // CATEGORIES
  // ========================================

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategoriesAPI();

        setCategories(data.categories || data || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    loadCategories();
  }, []);

  // ========================================
  // REDUX STATE
  // ========================================

  const { createProductLoading, createProductError } = useSelector(
    (state) => state.seller
  );

  // ========================================
  // PRODUCT FORM
  // ========================================

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    category_id: "",
    rating: "",
    stock: "",
  });

  // ========================================
  // IMAGES
  // ========================================

  const [mainImage, setMainImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  // ========================================
  // AI IMAGE
  // Keep this because AI page can pass
  // generated image to this page.
  // ========================================

  const [aiImage, setAiImage] = useState("");

  // ========================================
  // BRAND
  // Keep this because AI product can
  // pre-fill the brand.
  // ========================================

  const [brand, setBrand] = useState("");

  // ========================================
  // LOAD AI GENERATED PRODUCT
  // ========================================

  useEffect(() => {
    const aiProduct = location.state?.aiProduct;

    if (!aiProduct) {
      return;
    }

    console.log("AI generated product:", aiProduct);

    setFormData((prev) => ({
      ...prev,

      title: aiProduct.title || prev.title,

      description:
        aiProduct.description || prev.description,

      price:
        aiProduct.price !== undefined
          ? aiProduct.price
          : prev.price,

      rating:
        aiProduct.rating !== undefined
          ? aiProduct.rating
          : prev.rating,
    }));

    // Pre-fill brand if AI generated it
    if (aiProduct.brand) {
      setBrand(aiProduct.brand);
    }
  }, [location.state]);

  // ========================================
  // APPLY AI CATEGORY
  // ========================================

  useEffect(() => {
    const aiProduct = location.state?.aiProduct;

    if (
      !aiProduct ||
      !aiProduct.category ||
      categories.length === 0
    ) {
      return;
    }

    const aiCategory = String(aiProduct.category)
      .trim()
      .toLowerCase();

    const matchedCategory = categories.find(
      (category) =>
        String(category.name).trim().toLowerCase() ===
        aiCategory
    );

    if (matchedCategory) {
      setFormData((prev) => ({
        ...prev,
        category_id: matchedCategory.id,
      }));
    }
  }, [location.state, categories]);

  // ========================================
  // LOAD AI GENERATED IMAGE
  // Keep this because the separate AI page
  // can send an image here.
  // ========================================

  useEffect(() => {
    const image = location.state?.aiImage;

    if (image) {
      setAiImage(image);
      setMainImage(null);
    }
  }, [location.state]);

  // ========================================
  // INPUT CHANGE
  // ========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ========================================
  // MAIN IMAGE
  // ========================================

  const handleMainImage = (e) => {
    const selectedImage = e.target.files?.[0] || null;

    setMainImage(selectedImage);

    // Uploaded image replaces AI image
    if (selectedImage) {
      setAiImage("");
    }
  };

  // ========================================
  // GALLERY
  // ========================================

  const handleGalleryImages = (e) => {
    setGalleryImages(
      Array.from(e.target.files || [])
    );
  };

  // ========================================
  // CONVERT AI IMAGE TO FILE
  // ========================================

  const dataUrlToFile = async (dataUrl, fileName) => {
    const response = await fetch(dataUrl);

    const blob = await response.blob();

    return new File([blob], fileName, {
      type: blob.type || "image/jpeg",
    });
  };

  // ========================================
  // SUBMIT PRODUCT
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    // ======================================
    // PRODUCT DATA
    // ======================================

    data.append("title", formData.title);

    data.append("price", formData.price);

    data.append(
      "description",
      formData.description
    );

    data.append(
      "category_id",
      formData.category_id
    );

    data.append("stock", formData.stock);

    // ======================================
    // RATING
    // ======================================

    if (formData.rating !== "") {
      data.append("rating", formData.rating);
    }

    // ======================================
    // MAIN IMAGE
    // ======================================

    if (mainImage) {
      // Seller uploaded image
      data.append("image", mainImage);
    } else if (aiImage) {
      // AI image coming from separate AI page
      const aiFile = await dataUrlToFile(
        aiImage,
        "ai-product-image.jpg"
      );

      data.append("image", aiFile);
    }

    // ======================================
    // GALLERY IMAGES
    // ======================================

    galleryImages.forEach((file) => {
      data.append("images", file);
    });

    // ======================================
    // CREATE PRODUCT
    // ======================================

    try {
      await dispatch(
        createSellerProduct(data)
      ).unwrap();

      navigate("/seller/products");
    } catch (error) {
      console.error(
        "Create product error:",
        error
      );
    }
  };

  // ========================================
  // UI
  // ========================================

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

      {createProductError && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
          {createProductError}
        </div>
      )}

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl bg-white p-6 shadow"
      >
        {/* TITLE */}

        <div>
          <label className="mb-2 block font-medium">
            Product Title
          </label>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
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
            onChange={(e) =>
              setBrand(e.target.value)
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
            name="price"
            value={formData.price}
            onChange={handleChange}
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
    name="stock"
    min="0"
    step="1"
    value={formData.stock}
    onChange={handleChange}
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
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
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
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter product description"
            rows="8"
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
            name="rating"
            min="0"
            max="5"
            step="0.1"
            value={formData.rating}
            onChange={handleChange}
            placeholder="0 - 5"
            className="w-full rounded-lg border px-4 py-3"
          />
        </div>

        {/* MAIN IMAGE */}

        <div>
          <label className="mb-2 block font-medium">
            Main Image
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handleMainImage}
            className="w-full rounded-lg border px-4 py-3"
          />

          {aiImage && !mainImage && (
            <p className="mt-2 text-sm text-purple-600">
              AI generated image is selected as
              the main product image.
            </p>
          )}
        </div>

        {/* GALLERY */}

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
            <p className="mt-2 text-sm text-gray-500">
              {galleryImages.length} gallery
              image(s) selected.
            </p>
          )}
        </div>

        {/* BUTTONS */}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() =>
              navigate("/seller/products")
            }
            className="rounded-lg border px-5 py-3"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={createProductLoading}
            className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createProductLoading
              ? "Creating..."
              : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SellerAddProduct;