




















import { useState } from "react";
import { useSelector } from "react-redux";

import ProductCard from "./ProductCard";

function ProductTabs() {

  const [activeTab, setActiveTab] =
    useState("best");


  // ===============================
  // GET HOME SECTIONS FROM REDUX
  // ===============================

  const {
    bestSellers,
    topRated,
    newArrivals,
    homeSectionsLoading,
    homeSectionsError,
  } = useSelector(
    (state) => state.products
  );


  // ===============================
  // SELECT ACTIVE COLLECTION
  // ===============================

  let displayedProducts = [];

  if (activeTab === "best") {
    displayedProducts = bestSellers;
  }

  if (activeTab === "rated") {
    displayedProducts = topRated;
  }

  if (activeTab === "new") {
    displayedProducts = newArrivals;
  }


  // ===============================
  // LOADING
  // ===============================

  if (homeSectionsLoading) {
    return (
      <section className="max-w-7xl mx-auto px-6 py-12">

        <div className="flex justify-center gap-10 mb-10">

          <button
            className="text-2xl font-medium pb-3 border-b-2 border-gray-900"
          >
            Best Seller
          </button>

          <button
            className="text-2xl font-medium text-gray-500"
          >
            Top Rated
          </button>

          <button
            className="text-2xl font-medium text-gray-500"
          >
            New Arrival
          </button>

        </div>

        <p className="text-center">
          Loading products...
        </p>

      </section>
    );
  }


  // ===============================
  // ERROR
  // ===============================

  if (homeSectionsError) {
    return (
      <section className="max-w-7xl mx-auto px-6 py-12">

        <p className="text-center text-red-500">
          {homeSectionsError}
        </p>

      </section>
    );
  }


  return (
    <section className="max-w-7xl mx-auto px-6 py-12">


      {/* =========================
          TABS
      ========================= */}

      <div className="flex justify-center gap-10 mb-10">


        {/* BEST SELLER */}

        <button
          onClick={() => setActiveTab("best")}
          className={`
            text-2xl
            font-medium
            transition
            pb-3
            border-b-2

            ${
              activeTab === "best"
                ? "text-gray-900 border-gray-900"
                : "text-gray-500 border-transparent hover:text-gray-900"
            }
          `}
        >
          Best Seller
        </button>


        {/* TOP RATED */}

        <button
          onClick={() => setActiveTab("rated")}
          className={`
            text-2xl
            font-medium
            transition
            pb-3
            border-b-2

            ${
              activeTab === "rated"
                ? "text-gray-900 border-gray-900"
                : "text-gray-500 border-transparent hover:text-gray-900"
            }
          `}
        >
          Top Rated
        </button>


        {/* NEW ARRIVAL */}

        <button
          onClick={() => setActiveTab("new")}
          className={`
            text-2xl
            font-medium
            transition
            pb-3
            border-b-2

            ${
              activeTab === "new"
                ? "text-gray-900 border-gray-900"
                : "text-gray-500 border-transparent hover:text-gray-900"
            }
          `}
        >
          New Arrival
        </button>

      </div>


      {/* =========================
          PRODUCTS
      ========================= */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4
          gap-6
        "
      >

        {displayedProducts
          .slice(0, 4)
          .map((product) => (

            <ProductCard
              key={product.id}
              product={product}
            />

          ))}

      </div>

    </section>
  );
}

export default ProductTabs;