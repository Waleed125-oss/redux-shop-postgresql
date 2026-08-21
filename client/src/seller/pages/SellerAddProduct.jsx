import { useState, useEffect } from "react";
import { fetchCategoriesAPI } from "../../services/api";
import {
  useDispatch,
  useSelector,
} from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  createSellerProduct,
} from "../../store/slices/sellerSlice";

function SellerAddProduct() {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

   

//   useEffect(() => {
//   const loadCategories = async () => {
//     try {
//       const data = await fetchCategoriesAPI();

//       setCategories(data.categories || []);
//     } catch (error) {
//       console.error("Failed to fetch categories:", error);
//     }
//   };

//   loadCategories();
// }, []);


useEffect(() => {
  const loadCategories = async () => {
    try {
      const data = await fetchCategoriesAPI();

      console.log("Categories API response:", data);

      setCategories(data.categories || data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  loadCategories();
}, []);

  const {
    createProductLoading,
    createProductError,
  } = useSelector(
    (state) => state.seller
  );

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    category_id: "",
    rating: "",
  });

  const [mainImage, setMainImage] =
    useState(null);

  const [galleryImages, setGalleryImages] =
    useState([]);


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

    setMainImage(
      e.target.files[0]
    );

  };


  // ========================================
  // GALLERY
  // ========================================

  const handleGalleryImages = (e) => {

    setGalleryImages(
      Array.from(e.target.files)
    );

  };


  // ========================================
  // SUBMIT
  // ========================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    const data = new FormData();

    data.append(
      "title",
      formData.title
    );

    data.append(
      "price",
      formData.price
    );

    data.append(
      "description",
      formData.description
    );

    data.append(
      "category_id",
      formData.category_id
    );

    if (formData.rating !== "") {

      data.append(
        "rating",
        formData.rating
      );

    }


    // Main image
    if (mainImage) {

      data.append(
        "image",
        mainImage
      );

    }


    // Gallery images
    galleryImages.forEach((file) => {

      data.append(
        "images",
        file
      );

    });


    try {

      await dispatch(
        createSellerProduct(data)
      ).unwrap();

      // Return to products
      navigate("/seller/products");

    } catch (error) {

      console.error(
        "Create product error:",
        error
      );

    }

  };


  return (
    <div>

      {/* ================= HEADER ================= */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-gray-800">
          Add Product
        </h1>

        <p className="mt-2 text-gray-500">
          Add a new product to your store.
        </p>

      </div>


      {/* ================= ERROR ================= */}

      {createProductError && (

        <div className="
          mb-6
          p-4
          bg-red-50
          text-red-600
          rounded-lg
        ">
          {createProductError}
        </div>

      )}


      {/* ================= FORM ================= */}

      <form
        onSubmit={handleSubmit}
        className="
          bg-white
          rounded-xl
          shadow
          p-6
          space-y-6
        "
      >

        {/* TITLE */}

        <div>

          <label className="block mb-2 font-medium">
            Product Title
          </label>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter product title"
            className="
              w-full
              border
              rounded-lg
              px-4
              py-3
            "
          />

        </div>


        {/* PRICE */}

        <div>

          <label className="block mb-2 font-medium">
            Price
          </label>

          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Enter price"
            className="
              w-full
              border
              rounded-lg
              px-4
              py-3
            "
          />

        </div>


        {/* DESCRIPTION */}

        <div>

          <label className="block mb-2 font-medium">
            Description
          </label>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter product description"
            rows="5"
            className="
              w-full
              border
              rounded-lg
              px-4
              py-3
            "
          />

        </div>


     {/* CATEGORY */}

<div>

  <label className="block mb-2 font-medium">
    Category
  </label>

  <select
    name="category_id"
    value={formData.category_id}
    onChange={handleChange}
    className="
      w-full
      border
      rounded-lg
      px-4
      py-3
    "
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

     


        {/* RATING */}

        <div>

          <label className="block mb-2 font-medium">
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
            className="
              w-full
              border
              rounded-lg
              px-4
              py-3
            "
          />

        </div>


        {/* MAIN IMAGE */}

        <div>

          <label className="block mb-2 font-medium">
            Main Image
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handleMainImage}
          />

        </div>


        {/* GALLERY */}

        <div>

          <label className="block mb-2 font-medium">
            Gallery Images
          </label>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryImages}
          />

        </div>


        {/* BUTTONS */}

        <div className="flex gap-4">

          <button
            type="button"
            onClick={() =>
              navigate("/seller/products")
            }
            className="
              px-5
              py-3
              border
              rounded-lg
            "
          >
            Cancel
          </button>


          <button
            type="submit"
            disabled={createProductLoading}
            className="
              px-5
              py-3
              bg-blue-600
              text-white
              rounded-lg
              hover:bg-blue-700
              disabled:opacity-50
            "
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