

// import { useState, useEffect } from "react";
// import { fetchCategoriesAPI } from "../../services/api";
// import {
//   useDispatch,
//   useSelector,
// } from "react-redux";
// import {
//   useNavigate,
//   useLocation,
// } from "react-router-dom";

// import {
//   createSellerProduct,
// } from "../../store/slices/sellerSlice";

// function SellerAddProduct() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();

//   // ========================================
//   // CATEGORIES
//   // ========================================

//   const [categories, setCategories] = useState([]);

//   useEffect(() => {
//     const loadCategories = async () => {
//       try {
//         const data = await fetchCategoriesAPI();

//         console.log(
//           "Categories API response:",
//           data
//         );

//         setCategories(
//           data.categories || data || []
//         );
//       } catch (error) {
//         console.error(
//           "Failed to fetch categories:",
//           error
//         );
//       }
//     };

//     loadCategories();
//   }, []);

//   // ========================================
//   // REDUX STATE
//   // ========================================

//   const {
//     createProductLoading,
//     createProductError,
//   } = useSelector(
//     (state) => state.seller
//   );

//   // ========================================
//   // PRODUCT FORM
//   // ========================================

//   const [formData, setFormData] = useState({
//     title: "",
//     price: "",
//     description: "",
//     category_id: "",
//     rating: "",
//   });

//   // ========================================
//   // IMAGES
//   // ========================================

//   const [mainImage, setMainImage] =
//     useState(null);

//   const [galleryImages, setGalleryImages] =
//     useState([]);

//   // ========================================
//   // AI STATE
//   // ========================================

//   const [aiLoading, setAiLoading] =
//     useState(false);

//   const [imageLoading, setImageLoading] =
//     useState(false);

//   const [aiError, setAiError] =
//     useState("");

//   const [aiImage, setAiImage] =
//     useState("");

//   const [brand, setBrand] =
//     useState("");

//   const [aiDetails, setAiDetails] =
//     useState("");

//   // ========================================
//   // LOAD AI GENERATED PRODUCT
//   // ========================================

//   useEffect(() => {
//     const aiProduct =
//       location.state?.aiProduct;

//     if (!aiProduct) {
//       return;
//     }

//     console.log(
//       "AI generated product:",
//       aiProduct
//     );

//     setFormData((prev) => ({
//       ...prev,

//       title:
//         aiProduct.title ||
//         prev.title,

//       description:
//         aiProduct.description ||
//         prev.description,

//       price:
//         aiProduct.price !== undefined
//           ? aiProduct.price
//           : prev.price,

//       rating:
//         aiProduct.rating !== undefined
//           ? aiProduct.rating
//           : prev.rating,
//     }));

//     // Load AI generated brand if available
//     if (aiProduct.brand) {
//       setBrand(aiProduct.brand);
//     }

//     // Load AI generated details if available
//     if (aiProduct.details) {
//       setAiDetails(aiProduct.details);
//     }

//   }, [location.state]);

//   // ========================================
//   // APPLY AI CATEGORY
//   // ========================================

//   useEffect(() => {
//     const aiProduct =
//       location.state?.aiProduct;

//     if (
//       !aiProduct ||
//       !aiProduct.category ||
//       categories.length === 0
//     ) {
//       return;
//     }

//     const aiCategory =
//       String(aiProduct.category)
//         .trim()
//         .toLowerCase();

//     const matchedCategory =
//       categories.find(
//         (category) =>
//           String(category.name)
//             .trim()
//             .toLowerCase() ===
//           aiCategory
//       );

//     if (matchedCategory) {
//       setFormData((prev) => ({
//         ...prev,
//         category_id:
//           matchedCategory.id,
//       }));
//     }

//   }, [location.state, categories]);

//   // ========================================
//   // LOAD AI GENERATED IMAGE
//   // ========================================

//   useEffect(() => {
//     const image =
//       location.state?.aiImage;

//     if (image) {
//       setAiImage(image);
//       setMainImage(null);
//     }

//   }, [location.state]);

//   // ========================================
//   // INPUT CHANGE
//   // ========================================

//   const handleChange = (e) => {
//     const {
//       name,
//       value,
//     } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // ========================================
//   // MAIN IMAGE
//   // ========================================

//   const handleMainImage = (e) => {
//     setMainImage(
//       e.target.files[0]
//     );

//     // If seller selects a real image,
//     // remove previously generated AI image.
//     setAiImage("");
//   };

//   // ========================================
//   // GALLERY
//   // ========================================

//   const handleGalleryImages = (e) => {
//     setGalleryImages(
//       Array.from(e.target.files)
//     );
//   };

//   // ========================================
//   // GENERATE PRODUCT CONTENT WITH AI
//   // ========================================

//   const handleGenerateAI = async () => {
//     setAiError("");

//     // Product name validation
//     if (!formData.title.trim()) {
//       setAiError(
//         "Enter a product name first."
//       );
//       return;
//     }

//     // Category validation
//     if (!formData.category_id) {
//       setAiError(
//         "Select a category first."
//       );
//       return;
//     }

//     setAiLoading(true);

//     try {
//       // ====================================
//       // FIND SELECTED CATEGORY
//       // ====================================

//       const selectedCategory =
//         categories.find(
//           (category) =>
//             String(category.id) ===
//             String(formData.category_id)
//         );

//       // ====================================
//       // GET JWT TOKEN
//       // ====================================

//       const token =
//         localStorage.getItem("token");

//       // ====================================
//       // CALL AI CONTENT API
//       // ====================================

//       const response = await fetch(
//         "http://localhost:5000/api/ai/generate-product",
//         {
//           method: "POST",

//           headers: {
//             "Content-Type":
//               "application/json",

//             Authorization:
//               `Bearer ${token}`,
//           },

//           body: JSON.stringify({
//             productName:
//               formData.title,

//             category:
//               selectedCategory?.name || "",

//             brand,

//             details:
//               aiDetails,
//           }),
//         }
//       );

//       // ====================================
//       // CONVERT RESPONSE TO JSON
//       // ====================================

//       const data =
//         await response.json();

//       // ====================================
//       // CHECK API ERROR
//       // ====================================

//       if (!response.ok) {
//         throw new Error(
//           data.message ||
//             "Failed to generate product"
//         );
//       }

//       // ====================================
//       // GET GENERATED PRODUCT
//       // ====================================

//       const generatedProduct =
//         data.product;

//       if (!generatedProduct) {
//         throw new Error(
//           "AI did not return product content"
//         );
//       }

//       // ====================================
//       // UPDATE TITLE + DESCRIPTION
//       // ====================================

//       let generatedDescription =
//         generatedProduct.description ||
//         formData.description;

//       // ====================================
//       // ADD FEATURES
//       // ====================================

//       if (
//         generatedProduct.features &&
//         generatedProduct.features.length > 0
//       ) {
//         const featuresText =
//           "\n\nProduct Features:\n" +
//           generatedProduct.features
//             .map(
//               (feature) =>
//                 `• ${feature}`
//             )
//             .join("\n");

//         generatedDescription +=
//           featuresText;
//       }

//       // ====================================
//       // UPDATE FORM
//       // ====================================

//       setFormData((prev) => ({
//         ...prev,

//         title:
//           generatedProduct.title ||
//           prev.title,

//         description:
//           generatedDescription,
//       }));

//     } catch (error) {
//       console.error(
//         "AI generation error:",
//         error
//       );

//       setAiError(
//         error.message ||
//           "Unable to generate product content."
//       );

//     } finally {
//       setAiLoading(false);
//     }
//   };

//   // ========================================
//   // GENERATE PRODUCT IMAGE WITH AI
//   // ========================================

//   const handleGenerateImage = async () => {
//     setAiError("");

//     // ======================================
//     // PRODUCT NAME VALIDATION
//     // ======================================

//     if (!formData.title.trim()) {
//       setAiError(
//         "Enter a product name first."
//       );
//       return;
//     }

//     // ======================================
//     // CATEGORY VALIDATION
//     // ======================================

//     if (!formData.category_id) {
//       setAiError(
//         "Select a category first."
//       );
//       return;
//     }

//     setImageLoading(true);

//     try {
//       // ====================================
//       // FIND SELECTED CATEGORY
//       // ====================================

//       const selectedCategory =
//         categories.find(
//           (category) =>
//             String(category.id) ===
//             String(formData.category_id)
//         );

//       // ====================================
//       // GET JWT TOKEN
//       // ====================================

//       const token =
//         localStorage.getItem("token");

//       // ====================================
//       // CALL AI IMAGE API
//       // ====================================

//       const response = await fetch(
//         "http://localhost:5000/api/ai/generate-image",
//         {
//           method: "POST",

//           headers: {
//             "Content-Type":
//               "application/json",

//             Authorization:
//               `Bearer ${token}`,
//           },

//           body: JSON.stringify({
//             productName:
//               formData.title,

//             category:
//               selectedCategory?.name || "",

//             brand,

//             details:
//               aiDetails,
//           }),
//         }
//       );

//       // ====================================
//       // CONVERT RESPONSE TO JSON
//       // ====================================

//       const data =
//         await response.json();

//       if (!response.ok) {
//         throw new Error(
//           data.message ||
//             "Failed to generate image"
//         );
//       }

//       if (!data.image) {
//         throw new Error(
//           "AI did not return an image"
//         );
//       }

//       const imageUrl =
//         `data:${data.mimeType};base64,${data.image}`;

//       setAiImage(imageUrl);

//       setMainImage(null);

//     } catch (error) {
//       console.error(
//         "AI image generation error:",
//         error
//       );

//       setAiError(
//         error.message ||
//           "Unable to generate image."
//       );

//     } finally {
//       setImageLoading(false);
//     }
//   };

//   // ========================================
//   // CONVERT AI IMAGE DATA URL TO FILE
//   // ========================================

//   const dataUrlToFile = async (
//     dataUrl,
//     fileName
//   ) => {
//     const response =
//       await fetch(dataUrl);

//     const blob =
//       await response.blob();

//     return new File(
//       [blob],
//       fileName,
//       {
//         type:
//           blob.type ||
//           "image/jpeg",
//       }
//     );
//   };

//   // ========================================
//   // SUBMIT PRODUCT
//   // ========================================

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const data =
//       new FormData();

//     // ======================================
//     // PRODUCT DATA
//     // ======================================

//     data.append(
//       "title",
//       formData.title
//     );

//     data.append(
//       "price",
//       formData.price
//     );

//     data.append(
//       "description",
//       formData.description
//     );

//     data.append(
//       "category_id",
//       formData.category_id
//     );

//     // ======================================
//     // RATING
//     // ======================================

//     if (formData.rating !== "") {
//       data.append(
//         "rating",
//         formData.rating
//       );
//     }

//     // ======================================
//     // MAIN IMAGE
//     // ======================================

//     if (mainImage) {
//       // Seller uploaded image
//       data.append(
//         "image",
//         mainImage
//       );

//     } else if (aiImage) {
//       // AI generated image
//       const aiFile =
//         await dataUrlToFile(
//           aiImage,
//           "ai-product-image.jpg"
//         );

//       data.append(
//         "image",
//         aiFile
//       );
//     }

//     // ======================================
//     // GALLERY IMAGES
//     // ======================================

//     galleryImages.forEach(
//       (file) => {
//         data.append(
//           "images",
//           file
//         );
//       }
//     );

//     // ======================================
//     // CREATE PRODUCT
//     // ======================================

//     try {
//       await dispatch(
//         createSellerProduct(data)
//       ).unwrap();

//       navigate(
//         "/seller/products"
//       );

//     } catch (error) {
//       console.error(
//         "Create product error:",
//         error
//       );
//     }
//   };

//   // ========================================
//   // UI
//   // ========================================

//   return (
//     <div>

//       {/* ================= HEADER ================= */}

//       <div className="mb-8">

//         <h1 className="
//           text-3xl
//           font-bold
//           text-gray-800
//         ">
//           Add Product
//         </h1>

//         <p className="
//           mt-2
//           text-gray-500
//         ">
//           Add a new product to your store.
//         </p>

//       </div>

//       {/* ================= CREATE PRODUCT ERROR ================= */}

//       {createProductError && (
//         <div className="
//           mb-6
//           p-4
//           bg-red-50
//           text-red-600
//           rounded-lg
//         ">
//           {createProductError}
//         </div>
//       )}

//       {/* ================= FORM ================= */}

//       <form
//         onSubmit={handleSubmit}
//         className="
//           bg-white
//           rounded-xl
//           shadow
//           p-6
//           space-y-6
//         "
//       >

//         {/* ================= TITLE ================= */}

//         <div>

//           <label className="
//             block
//             mb-2
//             font-medium
//           ">
//             Product Title
//           </label>

//           <input
//             type="text"
//             name="title"
//             value={formData.title}
//             onChange={handleChange}
//             placeholder="Enter product title"
//             className="
//               w-full
//               border
//               rounded-lg
//               px-4
//               py-3
//             "
//           />

//         </div>

//         {/* ================= BRAND ================= */}

//         <div>

//           <label className="
//             block
//             mb-2
//             font-medium
//           ">
//             Brand
//           </label>

//           <input
//             type="text"
//             value={brand}
//             onChange={(e) =>
//               setBrand(
//                 e.target.value
//               )
//             }
//             placeholder="e.g. Apple, Samsung, Nike"
//             className="
//               w-full
//               border
//               rounded-lg
//               px-4
//               py-3
//             "
//           />

//         </div>

//         {/* ================= PRICE ================= */}

//         <div>

//           <label className="
//             block
//             mb-2
//             font-medium
//           ">
//             Price
//           </label>

//           <input
//             type="number"
//             name="price"
//             value={formData.price}
//             onChange={handleChange}
//             placeholder="Enter price"
//             className="
//               w-full
//               border
//               rounded-lg
//               px-4
//               py-3
//             "
//           />

//         </div>

//         {/* ================= CATEGORY ================= */}

//         <div>

//           <label className="
//             block
//             mb-2
//             font-medium
//           ">
//             Category
//           </label>

//           <select
//             name="category_id"
//             value={formData.category_id}
//             onChange={handleChange}
//             className="
//               w-full
//               border
//               rounded-lg
//               px-4
//               py-3
//             "
//             required
//           >

//             <option value="">
//               Select Category
//             </option>

//             {categories.map(
//               (category) => (
//                 <option
//                   key={category.id}
//                   value={category.id}
//                 >
//                   {category.name}
//                 </option>
//               )
//             )}

//           </select>

//         </div>

//         {/* ================= AI DETAILS ================= */}

//         <div>

//           <label className="
//             block
//             mb-2
//             font-medium
//           ">
//             Product Details for AI
//           </label>

//           <textarea
//             value={aiDetails}
//             onChange={(e) =>
//               setAiDetails(
//                 e.target.value
//               )
//             }
//             placeholder="Example: 256GB storage, 5G, titanium body, USB-C, premium smartphone..."
//             rows="4"
//             className="
//               w-full
//               border
//               rounded-lg
//               px-4
//               py-3
//             "
//           />

//           <p className="
//             text-sm
//             text-gray-500
//             mt-2
//           ">
//             Give AI basic information
//             about your product. AI will
//             generate professional product
//             content from it.
//           </p>

//         </div>

//         {/* ================= AI GENERATOR ================= */}

//         <div className="
//           bg-blue-50
//           border
//           border-blue-200
//           rounded-xl
//           p-5
//         ">

//           <div className="
//             flex
//             items-center
//             justify-between
//             gap-4
//             flex-wrap
//           ">

//             <div>

//               <h3 className="
//                 text-lg
//                 font-semibold
//                 text-blue-800
//               ">
//                 ✨ AI Product Generator
//               </h3>

//               <p className="
//                 text-sm
//                 text-blue-600
//                 mt-1
//               ">
//                 Generate professional product
//                 content and product images.
//               </p>

//             </div>

//             {/* ================= AI BUTTONS ================= */}

//             <div className="
//               flex
//               gap-3
//               flex-wrap
//             ">

//               {/* TEXT GENERATION */}

//               <button
//                 type="button"
//                 onClick={
//                   handleGenerateAI
//                 }
//                 disabled={
//                   aiLoading ||
//                   imageLoading
//                 }
//                 className="
//                   px-5
//                   py-3
//                   bg-blue-600
//                   text-white
//                   rounded-lg
//                   hover:bg-blue-700
//                   disabled:opacity-50
//                   disabled:cursor-not-allowed
//                   whitespace-nowrap
//                 "
//               >
//                 {aiLoading
//                   ? "✨ Generating..."
//                   : "✨ Generate Content"}
//               </button>

//               {/* IMAGE GENERATION */}

//               <button
//                 type="button"
//                 onClick={
//                   handleGenerateImage
//                 }
//                 disabled={
//                   aiLoading ||
//                   imageLoading
//                 }
//                 className="
//                   px-5
//                   py-3
//                   bg-purple-600
//                   text-white
//                   rounded-lg
//                   hover:bg-purple-700
//                   disabled:opacity-50
//                   disabled:cursor-not-allowed
//                   whitespace-nowrap
//                 "
//               >
//                 {imageLoading
//                   ? "🖼️ Generating..."
//                   : "🖼️ Generate Image"}
//               </button>

//             </div>

//           </div>

//           {/* ================= AI ERROR ================= */}

//           {aiError && (
//             <div className="
//               mt-4
//               p-3
//               bg-red-50
//               text-red-600
//               rounded-lg
//             ">
//               {aiError}
//             </div>
//           )}

//         </div>

//         {/* ================= AI GENERATED IMAGE ================= */}

//         {aiImage && (
//           <div className="mt-6">

//             <h3 className="
//               text-lg
//               font-semibold
//               mb-3
//             ">
//               AI Generated Image
//             </h3>

//             <div className="
//               border
//               rounded-xl
//               p-4
//               bg-gray-50
//             ">

//               <img
//                 src={aiImage}
//                 alt="AI generated product"
//                 className="
//                   w-full
//                   max-w-md
//                   h-80
//                   object-contain
//                   mx-auto
//                   rounded-lg
//                 "
//               />

//               <p className="
//                 text-sm
//                 text-green-600
//                 text-center
//                 mt-3
//               ">
//                 ✓ This image will be used as
//                 the main product image.
//               </p>

//             </div>

//           </div>
//         )}

//         {/* ================= DESCRIPTION ================= */}

//         <div>

//           <label className="
//             block
//             mb-2
//             font-medium
//           ">
//             Description
//           </label>

//           <textarea
//             name="description"
//             value={formData.description}
//             onChange={handleChange}
//             placeholder="Enter product description or generate it with AI"
//             rows="8"
//             className="
//               w-full
//               border
//               rounded-lg
//               px-4
//               py-3
//             "
//           />

//         </div>

//         {/* ================= RATING ================= */}

//         <div>

//           <label className="
//             block
//             mb-2
//             font-medium
//           ">
//             Rating
//           </label>

//           <input
//             type="number"
//             name="rating"
//             min="0"
//             max="5"
//             step="0.1"
//             value={formData.rating}
//             onChange={handleChange}
//             placeholder="0 - 5"
//             className="
//               w-full
//               border
//               rounded-lg
//               px-4
//               py-3
//             "
//           />

//         </div>

//         {/* ================= MAIN IMAGE ================= */}

//         <div>

//           <label className="
//             block
//             mb-2
//             font-medium
//           ">
//             Main Image
//           </label>

//           <input
//             type="file"
//             accept="image/*"
//             onChange={
//               handleMainImage
//             }
//           />

//           {aiImage && (
//             <p className="
//               text-sm
//               text-purple-600
//               mt-2
//             ">
//               AI image is currently selected
//               as the main image. Uploading
//               another image will replace it.
//             </p>
//           )}

//         </div>

//         {/* ================= GALLERY ================= */}

//         <div>

//           <label className="
//             block
//             mb-2
//             font-medium
//           ">
//             Gallery Images
//           </label>

//           <input
//             type="file"
//             accept="image/*"
//             multiple
//             onChange={
//               handleGalleryImages
//             }
//           />

//         </div>

//         {/* ================= BUTTONS ================= */}

//         <div className="
//           flex
//           gap-4
//         ">

//           <button
//             type="button"
//             onClick={() =>
//               navigate(
//                 "/seller/products"
//               )
//             }
//             className="
//               px-5
//               py-3
//               border
//               rounded-lg
//             "
//           >
//             Cancel
//           </button>

//           <button
//             type="submit"
//             disabled={
//               createProductLoading ||
//               aiLoading ||
//               imageLoading
//             }
//             className="
//               px-5
//               py-3
//               bg-blue-600
//               text-white
//               rounded-lg
//               hover:bg-blue-700
//               disabled:opacity-50
//               disabled:cursor-not-allowed
//             "
//           >
//             {createProductLoading
//               ? "Creating..."
//               : "Create Product"}
//           </button>

//         </div>

//       </form>

//     </div>
//   );
// }

// export default SellerAddProduct;









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