import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaStore, FaBoxOpen } from "react-icons/fa";

import { fetchAllSellersAPI } from "../services/api";

function ShopBySeller() {
  const navigate = useNavigate();

  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // FETCH SELLERS
  // ============================================

  useEffect(() => {
    const loadSellers = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await fetchAllSellersAPI();

        setSellers(data.sellers || []);
      } catch (err) {
        console.error("Failed to load sellers:", err);

        setError(err.message || "Failed to load sellers");
      } finally {
        setLoading(false);
      }
    };

    loadSellers();
  }, []);

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-sm sm:text-base text-gray-600">
            Loading sellers...
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR
  // ============================================

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <p className="text-red-600 font-medium text-sm sm:text-base break-words">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="
              mt-4
              px-5
              py-2.5
              bg-blue-600
              text-white
              rounded-lg
              hover:bg-blue-700
              transition
              text-sm
              sm:text-base
            "
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">

          {/* BACK TO HOME */}

          <button
            onClick={() => navigate("/")}
            className="
              inline-flex
              items-center
              gap-2
              mb-6
              px-3
              sm:px-4
              py-2
              rounded-lg
              bg-white/10
              hover:bg-white/20
              text-white
              text-xs
              sm:text-sm
              font-medium
              transition
            "
          >
            ← Back to Home
          </button>

          {/* TITLE */}

          <div className="flex items-center gap-3 sm:gap-4">

            {/* ICON */}

            <div
              className="
                w-11
                h-11
                sm:w-14
                sm:h-14
                bg-white/20
                rounded-xl
                sm:rounded-2xl
                flex
                items-center
                justify-center
                shrink-0
              "
            >
              <FaStore
                className="text-white"
                size={22}
              />
            </div>

            {/* TEXT */}

            <div className="min-w-0">
              <h1
                className="
                  text-2xl
                  sm:text-3xl
                  lg:text-4xl
                  font-bold
                  text-white
                  leading-tight
                "
              >
                Shop by Seller
              </h1>

              <p
                className="
                  text-blue-100
                  mt-1
                  text-xs
                  sm:text-sm
                  lg:text-base
                "
              >
                Discover products from our trusted sellers
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================
          SELLERS
      ======================================== */}

      <div
        className="
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          py-6
          sm:py-8
          lg:py-10
        "
      >

        {sellers.length === 0 ? (
          /* ========================================
             NO SELLERS
          ======================================== */

          <div className="text-center py-16 sm:py-20 px-4">

            <FaStore
              size={45}
              className="mx-auto text-gray-300 sm:w-[50px] sm:h-[50px]"
            />

            <h2
              className="
                mt-5
                text-lg
                sm:text-xl
                font-semibold
                text-gray-700
              "
            >
              No sellers available
            </h2>

            <p
              className="
                text-sm
                sm:text-base
                text-gray-500
                mt-2
                max-w-md
                mx-auto
              "
            >
              There are currently no approved sellers.
            </p>

          </div>
        ) : (

          /* ========================================
             SELLER GRID
          ======================================== */

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

            {sellers.map((seller) => (

              <div
                key={seller.seller_id}
                onClick={() =>
                  navigate(
                    `/shop/sellers/${seller.seller_id}`
                  )
                }
                className="
                  bg-white
                  rounded-xl
                  sm:rounded-2xl
                  border
                  border-gray-200
                  p-4
                  sm:p-5
                  lg:p-6
                  cursor-pointer
                  transition-all
                  duration-200
                  hover:-translate-y-1
                  hover:shadow-xl
                  hover:border-blue-300
                  active:scale-[0.99]
                "
              >

                {/* ==================================
                    SELLER INFO
                ================================== */}

                <div className="flex items-center gap-3 sm:gap-4">

                  {/* SELLER ICON */}

                  <div
                    className="
                      w-12
                      h-12
                      sm:w-14
                      sm:h-14
                      rounded-full
                      bg-gradient-to-r
                      from-blue-600
                      to-indigo-600
                      flex
                      items-center
                      justify-center
                      shrink-0
                    "
                  >
                    <FaStore
                      className="text-white"
                      size={20}
                    />
                  </div>

                  {/* SELLER NAME */}

                  <div className="min-w-0 flex-1">

                    <h2
                      className="
                        font-bold
                        text-base
                        sm:text-lg
                        text-gray-900
                        truncate
                      "
                      title={seller.business_name}
                    >
                      {seller.business_name}
                    </h2>

                    <p
                      className="
                        text-xs
                        sm:text-sm
                        text-gray-500
                        truncate
                      "
                      title={seller.seller_name}
                    >
                      {seller.seller_name}
                    </p>

                  </div>

                </div>

                {/* ==================================
                    DESCRIPTION
                ================================== */}

                {seller.description && (
                  <p
                    className="
                      text-xs
                      sm:text-sm
                      text-gray-600
                      mt-4
                      sm:mt-5
                      line-clamp-2
                      leading-relaxed
                    "
                  >
                    {seller.description}
                  </p>
                )}

                {/* ==================================
                    PRODUCT COUNT
                ================================== */}

                <div
                  className="
                    mt-5
                    sm:mt-6
                    pt-4
                    border-t
                    border-gray-100
                    flex
                    items-center
                    justify-between
                    gap-3
                  "
                >

                  {/* PRODUCT COUNT */}

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      text-gray-500
                      min-w-0
                    "
                  >
                    <FaBoxOpen
                      size={14}
                      className="shrink-0"
                    />

                    <span
                      className="
                        text-xs
                        sm:text-sm
                        truncate
                      "
                    >
                      {seller.product_count} products
                    </span>
                  </div>

                  {/* VISIT STORE */}

                  <span
                    className="
                      text-xs
                      sm:text-sm
                      font-semibold
                      text-blue-600
                      whitespace-nowrap
                    "
                  >
                    Visit Store →
                  </span>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default ShopBySeller;


