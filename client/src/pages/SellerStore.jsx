import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBoxOpen,
  FaStore,
} from "react-icons/fa";

import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { fetchSellerStoreAPI } from "../services/api";

function SellerStore() {
  const { sellerId } = useParams();

  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // FETCH SELLER STORE
  // ============================================

  useEffect(() => {
    const loadSellerStore = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await fetchSellerStoreAPI(sellerId);

        setSeller(data.seller);
        setProducts(data.products || []);
      } catch (err) {
        setError(
          err.message || "Failed to load seller store"
        );
      } finally {
        setLoading(false);
      }
    };

    loadSellerStore();
  }, [sellerId]);

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="min-h-[60vh] px-4 flex items-center justify-center">
          <div className="text-center">
            <div
              className="
                w-10
                h-10
                border-4
                border-blue-600
                border-t-transparent
                rounded-full
                animate-spin
                mx-auto
              "
            />

            <p className="mt-4 text-sm sm:text-base text-gray-600">
              Loading seller store...
            </p>
          </div>
        </div>
      </>
    );
  }

  // ============================================
  // ERROR / SELLER NOT FOUND
  // ============================================

  if (error || !seller) {
    return (
      <>
        <Navbar />

        <div
          className="
            min-h-[60vh]
            px-4
            sm:px-6
            py-12
            sm:py-16
            flex
            items-center
            justify-center
          "
        >
          <div className="max-w-md w-full text-center">
            <p className="text-sm sm:text-base text-red-600">
              {error || "Seller store not found"}
            </p>

            <Link
              to="/shop/sellers"
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                mt-6
                px-4
                py-2
                rounded-lg
                bg-blue-600
                hover:bg-blue-700
                text-white
                text-sm
                sm:text-base
                font-medium
                transition
              "
            >
              <FaArrowLeft size={13} />
              Back to sellers
            </Link>
          </div>
        </div>
      </>
    );
  }

  // ============================================
  // SELLER STORE
  // ============================================

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">

        {/* ========================================
            SELLER HEADER
        ======================================== */}

        <section className="bg-gradient-to-r from-blue-600 to-indigo-600">
          <div
            className="
              max-w-7xl
              mx-auto
              px-4
              sm:px-6
              lg:px-8
              py-8
              sm:py-10
              lg:py-12
              text-white
            "
          >

            {/* BACK TO ALL SELLERS */}

            <Link
              to="/shop/sellers"
              className="
                inline-flex
                items-center
                gap-2
                text-blue-100
                hover:text-white
                text-sm
                sm:text-base
                transition
              "
            >
              <FaArrowLeft size={13} />
              <span>All sellers</span>
            </Link>


            {/* SELLER INFORMATION */}

            <div
              className="
                flex
                flex-col
                sm:flex-row
                items-start
                sm:items-center
                gap-4
                sm:gap-5
                mt-6
                sm:mt-8
              "
            >

              {/* STORE ICON */}

              <div
                className="
                  w-14
                  h-14
                  sm:w-16
                  sm:h-16
                  rounded-xl
                  sm:rounded-2xl
                  bg-white/20
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
              >
                <FaStore
                  size={26}
                  className="sm:w-[30px] sm:h-[30px]"
                />
              </div>


              {/* SELLER NAME */}

              <div className="min-w-0 w-full">
                <h1
                  className="
                    text-2xl
                    sm:text-3xl
                    lg:text-4xl
                    font-bold
                    break-words
                  "
                >
                  {seller.business_name}
                </h1>

                <p
                  className="
                    text-blue-100
                    mt-1
                    text-sm
                    sm:text-base
                    break-words
                  "
                >
                  {seller.seller_name}
                </p>
              </div>
            </div>


            {/* SELLER DESCRIPTION */}

            {seller.description && (
              <p
                className="
                  max-w-2xl
                  mt-5
                  sm:mt-6
                  text-blue-100
                  text-sm
                  sm:text-base
                  leading-6
                  sm:leading-7
                  break-words
                "
              >
                {seller.description}
              </p>
            )}
          </div>
        </section>


        {/* ========================================
            PRODUCTS SECTION
        ======================================== */}

        <section
          className="
            max-w-7xl
            mx-auto
            px-4
            sm:px-6
            lg:px-8
            py-8
            sm:py-10
            lg:py-12
          "
        >

          {/* SECTION TITLE */}

          <div
            className="
              flex
              items-center
              gap-2
              mb-5
              sm:mb-6
            "
          >
            <FaBoxOpen
              className="text-blue-600 shrink-0"
              size={18}
            />

            <h2
              className="
                text-xl
                sm:text-2xl
                font-bold
                text-gray-900
              "
            >
              Products from this seller
            </h2>
          </div>


          {/* NO PRODUCTS */}

          {products.length === 0 ? (
            <div
              className="
                bg-white
                rounded-xl
                border
                border-gray-200
                px-4
                py-10
                sm:py-14
                text-center
              "
            >
              <FaBoxOpen
                size={40}
                className="mx-auto text-gray-300"
              />

              <p
                className="
                  mt-4
                  text-sm
                  sm:text-base
                  text-gray-600
                "
              >
                This seller has no products available.
              </p>
            </div>
          ) : (

            /* PRODUCTS */

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
                gap-4
                sm:gap-5
                lg:gap-6
              "
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          )}

        </section>
      </main>
    </>
  );
}

export default SellerStore;