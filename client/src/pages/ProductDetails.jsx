import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import Navbar from "../components/Navbar";
import { addToCart } from "../store/slices/cartSlice";
import { fetchSingleProduct } from "../store/slices/productSlice";

function ProductDetails() {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { id } = useParams();

  const [selectedImage, setSelectedImage] = useState(null);


  // ================= PRODUCT =================

  const product = useSelector(
    (state) => state.products.selectedProduct
  );


  // ================= FETCH PRODUCT =================

  useEffect(() => {

    dispatch(
      fetchSingleProduct(id)
    );

  }, [dispatch, id]);


  // ================= LOADING =================

  if (!product) {

    return (
      <>
        <Navbar />

        <div className="max-w-7xl mx-auto p-8">

          <h2 className="text-3xl font-bold text-gray-600">
            Loading product...
          </h2>

        </div>
      </>
    );

  }


  // ================= MAIN IMAGE =================

  const mainImage = product.image
    ? `${import.meta.env.VITE_API_URL}${product.image}`
    : null;


  // ================= GALLERY IMAGES =================

  const galleryImages = product.images || [];


  // ================= ALL IMAGES =================

  const allImages = [

    ...(mainImage
      ? [
          {
            id: "main",
            image: mainImage,
          },
        ]
      : []),

    ...galleryImages.map((item) => ({
      id: item.id,
      image:
        `${import.meta.env.VITE_API_URL}${item.image}`,
    })),

  ];


  // ================= CURRENT IMAGE =================

  const currentImage =
    selectedImage || mainImage;


  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">
            <button
    onClick={() => navigate(-1)}
    className="
      mb-6
      inline-flex
      items-center
      gap-2
      text-gray-600
      hover:text-blue-600
      font-medium
      transition
    "
  >
    ← Back to Products
  </button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">


          {/* ================= PRODUCT GALLERY ================= */}

          <div>


            {/* MAIN IMAGE */}

            <div
              className="
                bg-gray-50
                rounded-2xl
                border
                border-gray-200
                p-6
                flex
                items-center
                justify-center
              "
            >

              {currentImage ? (

                <img
                  src={currentImage}
                  alt={product.title}
                  className="
                    w-full
                    h-[500px]
                    object-contain
                    rounded-xl
                  "
                />

              ) : (

                <div
                  className="
                    w-full
                    h-[500px]
                    flex
                    items-center
                    justify-center
                    text-gray-400
                  "
                >
                  No Image Available
                </div>

              )}

            </div>


            {/* ================= THUMBNAILS ================= */}

            {allImages.length > 0 && (

              <div
                className="
                  flex
                  gap-3
                  mt-5
                  overflow-x-auto
                  pb-2
                "
              >

                {allImages.map((item) => (

                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setSelectedImage(item.image)
                    }
                    className={`
                      flex-shrink-0
                      w-24
                      h-24
                      rounded-xl
                      border-2
                      overflow-hidden
                      bg-gray-50
                      transition

                      ${
                        currentImage === item.image
                          ? "border-blue-600"
                          : "border-gray-200 hover:border-blue-400"
                      }
                    `}
                  >

                    <img
                      src={item.image}
                      alt={product.title}
                      className="
                        w-full
                        h-full
                        object-contain
                      "
                    />

                  </button>

                ))}

              </div>

            )}

          </div>


          {/* ================= PRODUCT DETAILS ================= */}

          <div className="space-y-6">


            {/* TITLE */}

            <h1 className="text-4xl font-bold text-gray-900">

              {product.title}

            </h1>


            {/* RATING */}

            <div className="flex items-center gap-2 text-xl">

              <span className="text-yellow-500">
                ⭐
              </span>

              <span className="text-yellow-500 font-medium">

                {product.rating ?? "5.0"}

              </span>

            </div>


            {/* CATEGORY */}

            <div>

              <span
                className="
                  inline-flex
                  bg-blue-50
                  text-blue-600
                  px-4
                  py-2
                  rounded-full
                  font-medium
                "
              >

                {product.category}

              </span>

            </div>


            {/* PRICE */}

            <p className="text-4xl font-bold text-blue-600">

              $
              {Number(
                product.price
              ).toLocaleString()}

            </p>


            {/* DESCRIPTION */}

            <div>

              <h2
                className="
                  text-lg
                  font-semibold
                  text-gray-900
                  mb-2
                "
              >
                Description
              </h2>

              <p
                className="
                  text-gray-600
                  leading-8
                "
              >

                {product.description ||
                  "No description available."}

              </p>

            </div>


            {/* ADD TO CART */}

            <button
              onClick={() =>
                dispatch(
                  addToCart(product.id)
                )
              }
              className="
                mt-4
                bg-blue-600
                hover:bg-blue-700
                text-white
                font-semibold
                px-8
                py-4
                rounded-xl
                transition
                duration-200
                shadow-sm
              "
            >

              Add To Cart

            </button>


          </div>

        </div>

      </div>

    </>
  );
}


export default ProductDetails;