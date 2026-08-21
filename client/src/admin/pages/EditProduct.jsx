






























































































































import { useEffect, useState } from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  fetchCategories,
} from "../../store/slices/categorySlice";

import {
  fetchSingleProduct,
  updateProduct,
} from "../../store/slices/productSlice";

import {
  deleteProductImageAPI,
} from "../../services/api";


function EditProduct() {

  const { id } = useParams();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const location = useLocation();


  // Remember the page from Products.jsx
  const previousPage =
    location.state?.page || 1;


  // ================= CATEGORIES =================

  const {
    categories,
  } = useSelector(
    (state) => state.categories
  );


  // ================= PRODUCT =================

  const product = useSelector(
    (state) => state.products.selectedProduct
  );


  // ================= FORM STATE =================

  const [title, setTitle] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [category_id, setCategoryId] =
    useState("");

  // New main product image
  const [image, setImage] =
    useState(null);

  // Existing main image
  const [oldImage, setOldImage] =
    useState("");

  const [rating, setRating] =
    useState("");


  // Existing gallery images
  const [images, setImages] =
    useState([]);


  // New gallery images
  const [newImages, setNewImages] =
    useState([]);


  // ================= FETCH CATEGORIES =================

  useEffect(() => {

    dispatch(fetchCategories());

  }, [dispatch]);


  // ================= FETCH PRODUCT =================

  useEffect(() => {

    dispatch(
      fetchSingleProduct(id)
    );

  }, [dispatch, id]);


  // ================= FILL FORM =================

  useEffect(() => {

    if (!product) {
      return;
    }


    setTitle(
      product.title || ""
    );

    setPrice(
      product.price || ""
    );

    setDescription(
      product.description || ""
    );

    setCategoryId(
      product.category_id || ""
    );

    setOldImage(
      product.image || ""
    );

    // No new main image initially
    setImage(null);

    setRating(
      product.rating || ""
    );


    // Existing gallery
    setImages(
      product.images || []
    );


    // Clear newly selected gallery images
    setNewImages([]);

  }, [product]);


  // ================= REMOVE GALLERY IMAGE =================

  const handleRemoveImage =
    async (imageId) => {

      try {

        await deleteProductImageAPI(
          imageId
        );


        setImages(
          (prevImages) =>
            prevImages.filter(
              (image) =>
                image.id !== imageId
            )
        );

      } catch (error) {

        console.error(
          "Failed to delete gallery image:",
          error
        );

      }

    };


  // ================= SUBMIT =================

  const handleSubmit =
    async (e) => {

      e.preventDefault();


      try {

        const formData =
          new FormData();


        formData.append(
          "title",
          title
        );

        formData.append(
          "price",
          price
        );

        formData.append(
          "description",
          description
        );

        formData.append(
          "category_id",
          category_id
        );

        formData.append(
          "rating",
          rating
        );


        // ================= MAIN IMAGE =================

        // Only send a new main image
        // if the admin selected one.

        if (image) {

          formData.append(
            "image",
            image
          );

        }


        // ================= GALLERY IMAGES =================

        newImages.forEach(
          (file) => {

            formData.append(
              "images",
              file
            );

          }
        );


        // ================= UPDATE =================

        await dispatch(
          updateProduct({
            id,
            productData: formData,
          })
        ).unwrap();


        // ================= RETURN TO SAME PAGE =================

        navigate(
          "/admin/products",
          {
            state: {
              page: previousPage,
            },
          }
        );

      } catch (error) {

        console.error(
          "Failed to update product:",
          error
        );

      }

    };


  // ================= UI =================

  return (

    <div className="max-w-3xl mx-auto">


      <h1 className="text-3xl font-bold mb-8">
        Edit Product
      </h1>


      <form
        onSubmit={handleSubmit}
        className="
          bg-white
          shadow-lg
          rounded-xl
          p-6
          space-y-5
        "
      >


        {/* ================= CURRENT IMAGE ================= */}

        <div>

          <label className="block font-semibold mb-2">
            Current Image
          </label>


          {oldImage && (

            <img
              src={`${
                import.meta.env.VITE_API_URL
              }${oldImage}`}
              alt="Product"
              className="
                w-48
                h-48
                object-cover
                rounded-lg
                border
                mb-4
              "
            />

          )}

        </div>


        {/* ================= GALLERY IMAGES ================= */}

        <div>

          <label className="block font-semibold mb-2">
            Gallery Images
          </label>


          {images.length === 0 ? (

            <p className="text-gray-500 mb-4">
              No gallery images available.
            </p>

          ) : (

            <div className="grid grid-cols-3 gap-4">

              {images.map(
                (item) => (

                  <div
                    key={item.id}
                    className="relative"
                  >

                    <img
                      src={`${
                        import.meta.env.VITE_API_URL
                      }${item.image}`}
                      alt="Gallery"
                      className="
                        w-full
                        h-32
                        object-cover
                        rounded-lg
                        border
                      "
                    />


                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveImage(
                          item.id
                        )
                      }
                      className="
                        absolute
                        top-1
                        right-1
                        bg-red-600
                        hover:bg-red-700
                        text-white
                        text-xs
                        px-2
                        py-1
                        rounded
                      "
                    >
                      Remove
                    </button>

                  </div>

                )
              )}

            </div>

          )}

        </div>


        {/* ================= TITLE ================= */}

        <input
          type="text"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          className="
            w-full
            border
            p-3
            rounded
          "
          placeholder="Title"
          required
        />


        {/* ================= PRICE ================= */}

        <input
          type="number"
          value={price}
          onChange={(e) =>
            setPrice(e.target.value)
          }
          className="
            w-full
            border
            p-3
            rounded
          "
          placeholder="Price"
          required
        />


        {/* ================= DESCRIPTION ================= */}

        <textarea
          value={description}
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
          className="
            w-full
            border
            p-3
            rounded
          "
          placeholder="Description"
          rows="5"
        />


        {/* ================= CATEGORY ================= */}

        <select
          value={category_id}
          onChange={(e) =>
            setCategoryId(
              e.target.value
            )
          }
          className="
            w-full
            border
            p-3
            rounded
          "
          required
        >

          <option value="">
            Select Category
          </option>


          {categories.map(
            (item) => (

              <option
                key={item.id}
                value={item.id}
              >
                {item.name}
              </option>

            )
          )}

        </select>


        {/* ================= MAIN IMAGE ================= */}

        <div>

          <label className="block font-semibold mb-2">
            Replace Main Image
          </label>


          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImage(
                e.target.files[0] || null
              )
            }
            className="
              w-full
              border
              p-3
              rounded
            "
          />

        </div>


        {/* ================= NEW GALLERY ================= */}

        <div>

          <label className="block font-semibold mb-2">
            Add Gallery Images
          </label>


          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) =>
              setNewImages(
                Array.from(
                  e.target.files
                )
              )
            }
            className="
              w-full
              border
              p-3
              rounded
            "
          />

        </div>


        {/* ================= RATING ================= */}

        <input
          type="number"
          step="0.1"
          min="0"
          max="5"
          value={rating}
          onChange={(e) =>
            setRating(
              e.target.value
            )
          }
          className="
            w-full
            border
            p-3
            rounded
          "
          placeholder="Rating"
        />


        {/* ================= UPDATE ================= */}

        <button
          type="submit"
          className="
            bg-blue-600
            hover:bg-blue-700
            text-white
            px-6
            py-3
            rounded
          "
        >
          Update Product
        </button>


      </form>

    </div>

  );

}


export default EditProduct;