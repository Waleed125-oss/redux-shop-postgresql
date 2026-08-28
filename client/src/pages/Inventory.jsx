import debounce from "lodash/debounce";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Package,
  ShoppingBag,
  Sparkles,
  Filter,
  Banknote,
  BarChart3,
  Star,
  ArrowLeftRight,
  RotateCcw,
  SlidersHorizontal,
  Search,
} from "lucide-react";

import ProductCard from "../components/ProductCard";
import Navbar from "../components/Navbar";

import { fetchProducts } from "../store/slices/productSlice";


function Inventory() {

  const dispatch = useDispatch();

  const [searchParams] = useSearchParams();


  // =====================================================
  // CATEGORY FROM URL
  // =====================================================

  const selectedCategory =
    searchParams.get("category") || "";


  // =====================================================
  // PAGE
  // =====================================================

  const [page, setPage] = useState(1);


  // =====================================================
  // FILTERS
  // =====================================================

  const [sort, setSort] =
    useState("");

  const [minPrice, setMinPrice] =
    useState("");

  const [maxPrice, setMaxPrice] =
    useState("");

  const [rating, setRating] =
    useState("");


  // =====================================================
  // PRODUCTS FROM REDUX
  // =====================================================

  const {
    products,
    loading,
    error,
    currentPage,
    totalPages,
    totalProducts,
  } = useSelector(
    (state) => state.products
  );


  // =====================================================
  // SEARCH FROM REDUX
  // =====================================================

  const search =
    useSelector(
      (state) => state.search.search
    );
 

    const debouncedFetchProducts = useRef(
  debounce((params) => {
    dispatch(fetchProducts(params));
  }, 500)
).current;

  // =====================================================
  // FETCH PRODUCTS
  // =====================================================

useEffect(() => {
  debouncedFetchProducts({
    page,
    limit: 12,
    search,
    category_id: selectedCategory,
    sort,
    min_price: minPrice,
    max_price: maxPrice,
    rating,
  });

  return () => {
    debouncedFetchProducts.cancel();
  };
}, [
  search,
  minPrice,
  maxPrice,
  page,
  selectedCategory,
  sort,
  rating,
  debouncedFetchProducts,
]);

  // =====================================================
  // RESET PAGE WHEN FILTERS CHANGE
  // =====================================================

  useEffect(() => {

    setPage(1);

  }, [
    selectedCategory,
    search,
    sort,
    minPrice,
    maxPrice,
    rating,
  ]);


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const handleClearFilters = () => {

    setSort("");

    setMinPrice("");

    setMaxPrice("");

    setRating("");

    setPage(1);

  };


  // =====================================================
  // APPLY FILTERS
  // (filters already auto-apply via the effect above whenever
  // state changes — this button just re-triggers the same fetch
  // for the current values, no new params/logic introduced)
  // =====================================================

//   const handleApplyFilters = () => {

//     dispatch(
//       fetchProducts({
//         page: 1,
//         limit: 12,
//         search,
//         category_id: selectedCategory,
//         sort,
//         min_price: minPrice,
//         max_price: maxPrice,
//         rating,
//       })
//     );

//     setPage(1);

//   };



const handleApplyFilters = () => {
  setPage(1);

  debouncedFetchProducts({
    page: 1,
    limit: 12,
    search,
    category_id: selectedCategory,
    sort,
    min_price: minPrice,
    max_price: maxPrice,
    rating,
  });
};

  const activeFilterCount = [
    sort,
    minPrice,
    maxPrice,
    rating,
  ].filter(Boolean).length;


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <>

      {/* =================================================
          NAVBAR
      ================================================= */}

      <Navbar />


      {/* =================================================
          MAIN
      ================================================= */}

      <main
        className="
          max-w-7xl
          mx-auto
          px-6
          py-10
          bg-gradient-to-b
          from-indigo-50/40
          via-white
          to-white
          min-h-screen
        "
      >


        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">

          <div className="flex items-start gap-4">

            <div
              className="
                flex-shrink-0
                w-14
                h-14
                rounded-2xl
                bg-indigo-50
                text-indigo-600
                flex
                items-center
                justify-center
              "
            >
              <Package size={26} strokeWidth={2.2} />
            </div>

            <div>

              <h1
                className="
                  text-3xl
                  sm:text-4xl
                  font-extrabold
                  tracking-tight
                  text-slate-900
                "
              >
                Inventory
              </h1>

              <p
                className="
                  text-slate-500
                  mt-1
                  text-sm
                "
              >
                {selectedCategory
                  ? "Showing products for selected category"
                  : "Browse and filter products to find exactly what you need"}
              </p>

            </div>

          </div>


          {!loading && !error && (

            <div
              className="
                inline-flex
                items-center
                gap-2
                bg-indigo-50
                text-indigo-700
                font-semibold
                text-sm
                px-4
                py-2.5
                rounded-full
              "
            >
              <ShoppingBag size={16} />
              {totalProducts} Product
              {totalProducts !== 1 ? "s" : ""}
            </div>

          )}

        </div>


        {/* =================================================
            FILTER SECTION
        ================================================= */}

        <div
          className="
            relative
            flex
            flex-col
            lg:flex-row
            rounded-2xl
            shadow-md
            shadow-indigo-100
            border
            border-indigo-100
            overflow-hidden
            mb-8
            bg-white
          "
        >

          {/* -----------------------------------------------
              LEFT LABEL PANEL (signature diagonal accent)
          ----------------------------------------------- */}

          <div
            className="
              relative
              flex
              items-center
              gap-3
              px-6
              py-5
              lg:py-0
              lg:pr-12
              text-white
              bg-gradient-to-br
              from-indigo-600
              via-indigo-600
              to-violet-600
              overflow-hidden
              shrink-0
            "
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 82% 100%, 0% 100%)",
            }}
          >

            <Sparkles
              size={16}
              className="absolute top-3 left-16 text-white/40"
            />

            <div
              className="
                w-11
                h-11
                rounded-xl
                bg-white/15
                flex
                items-center
                justify-center
                shrink-0
              "
            >
              <Filter size={20} />
            </div>

            <div>

              <p className="font-bold leading-tight">
                Filter Products
              </p>

              <p className="text-xs text-indigo-100">
                Refine your search
              </p>

            </div>

          </div>


          {/* -----------------------------------------------
              FIELDS PANEL
          ----------------------------------------------- */}

          <div
            className="
              flex-1
              flex
              flex-col
              lg:flex-row
              lg:items-end
              gap-4
              px-6
              py-5
            "
          >


            {/* =============================================
                MIN PRICE
            ============================================= */}

            <div className="flex-1 min-w-[140px]">

              <label
                className="
                  flex
                  items-center
                  gap-1.5
                  text-sm
                  font-semibold
                  text-slate-700
                  mb-1.5
                "
              >
                <Banknote size={15} className="text-indigo-500" />
                Min Price
              </label>


              <div className="relative">

                <span
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                    text-xs
                    font-medium
                    bg-white
                    pr-1
                    z-10
                  "
                >
                  USD
                </span>

                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(e) => {

                    setMinPrice(
                      e.target.value
                    );

                  }}
                  placeholder="0"
                  className="
                    w-full
                    border
                    border-slate-200
                    rounded-xl
                    pl-12
                    pr-3
                    py-2.5
                    text-sm
                    font-medium
                    outline-none
                    transition
                    focus:border-indigo-500
                    focus:ring-2
                    focus:ring-indigo-100
                  "
                />

              </div>

            </div>


            {/* =============================================
                MAX PRICE
            ============================================= */}

            <div className="flex-1 min-w-[140px]">

              <label
                className="
                  flex
                  items-center
                  gap-1.5
                  text-sm
                  font-semibold
                  text-slate-700
                  mb-1.5
                "
              >
                <BarChart3 size={15} className="text-indigo-500" />
                Max Price
              </label>


              <div className="relative">

                <span
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                    text-xs
                    font-medium
                    bg-white
                    pr-1
                    z-10
                  "
                >
                  USD
                </span>

                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => {

                    setMaxPrice(
                      e.target.value
                    );

                  }}
                  placeholder="Any"
                  className="
                    w-full
                    border
                    border-slate-200
                    rounded-xl
                    pl-12
                    pr-3
                    py-2.5
                    text-sm
                    font-medium
                    outline-none
                    transition
                    focus:border-indigo-500
                    focus:ring-2
                    focus:ring-indigo-100
                  "
                />

              </div>

            </div>


            {/* =============================================
                RATING
            ============================================= */}

            <div className="flex-1 min-w-[160px]">

              <label
                className="
                  flex
                  items-center
                  gap-1.5
                  text-sm
                  font-semibold
                  text-slate-700
                  mb-1.5
                "
              >
                <Star size={15} className="text-amber-500" />
                Rating
              </label>


              <select
                value={rating}
                onChange={(e) => {

                  setRating(
                    e.target.value
                  );

                }}
                className="
                  w-full
                  border
                  border-slate-200
                  rounded-xl
                  px-3
                  py-2.5
                  text-sm
                  font-medium
                  outline-none
                  bg-white
                  transition
                  focus:border-indigo-500
                  focus:ring-2
                  focus:ring-indigo-100
                "
              >

                <option value="">
                  All Ratings
                </option>

                <option value="4">
                  4★ & Above
                </option>

                <option value="3">
                  3★ & Above
                </option>

                <option value="2">
                  2★ & Above
                </option>

                <option value="1">
                  1★ & Above
                </option>

              </select>

            </div>


            {/* =============================================
                SORT
            ============================================= */}

            <div className="flex-1 min-w-[180px]">

              <label
                className="
                  flex
                  items-center
                  gap-1.5
                  text-sm
                  font-semibold
                  text-slate-700
                  mb-1.5
                "
              >
                <ArrowLeftRight size={15} className="text-indigo-500" />
                Sort Products
              </label>


              <select
                value={sort}
                onChange={(e) => {

                  setSort(
                    e.target.value
                  );

                }}
                className="
                  w-full
                  border
                  border-slate-200
                  rounded-xl
                  px-3
                  py-2.5
                  text-sm
                  font-medium
                  outline-none
                  bg-white
                  transition
                  focus:border-indigo-500
                  focus:ring-2
                  focus:ring-indigo-100
                "
              >

                <option value="">
                  Default Sorting
                </option>

                <option value="price_asc">
                  Price: Low → High
                </option>

                <option value="price_desc">
                  Price: High → Low
                </option>

                <option value="rating_desc">
                  Highest Rated
                </option>

                <option value="newest">
                  Newest
                </option>

                <option value="title_asc">
                  Title: A → Z
                </option>

                <option value="title_desc">
                  Title: Z → A
                </option>

              </select>

            </div>


            {/* =============================================
                CLEAR + APPLY
            ============================================= */}

            <div className="flex items-center gap-2 shrink-0">

              <button
                onClick={
                  handleClearFilters
                }
                title="Clear filters"
                className="
                  relative
                  flex
                  items-center
                  gap-1.5
                  bg-slate-100
                  hover:bg-slate-200
                  text-slate-700
                  font-semibold
                  text-sm
                  px-4
                  py-2.5
                  rounded-xl
                  transition
                  whitespace-nowrap
                "
              >
                <RotateCcw size={15} />
                Clear
                {activeFilterCount > 0 && (
                  <span
                    className="
                      absolute
                      -top-1.5
                      -right-1.5
                      inline-flex
                      items-center
                      justify-center
                      w-[18px]
                      h-[18px]
                      text-[10px]
                      font-bold
                      rounded-full
                      bg-indigo-600
                      text-white
                    "
                  >
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <button
                onClick={handleApplyFilters}
                className="
                  flex
                  items-center
                  gap-1.5
                  bg-gradient-to-r
                  from-indigo-600
                  to-violet-600
                  hover:from-indigo-700
                  hover:to-violet-700
                  text-white
                  font-semibold
                  text-sm
                  px-5
                  py-2.5
                  rounded-xl
                  transition
                  shadow-sm
                  shadow-indigo-200
                  whitespace-nowrap
                "
              >
                <SlidersHorizontal size={15} />
                Apply Filters
              </button>

            </div>

          </div>

        </div>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-4
              gap-6
            "
          >

            {Array.from({ length: 8 }).map((_, i) => (

              <div
                key={i}
                className="
                  animate-pulse
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  overflow-hidden
                "
              >
                <div className="aspect-square bg-slate-100" />
                <div className="p-4 space-y-2">
                  <div className="h-3 w-3/4 bg-slate-100 rounded" />
                  <div className="h-3 w-1/2 bg-slate-100 rounded" />
                </div>
              </div>

            ))}

          </div>

        )}


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div
            className="
              bg-red-50
              border
              border-red-200
              rounded-xl
              p-5
              mb-6
              flex
              items-start
              gap-3
            "
          >

            <div
              className="
                flex-shrink-0
                w-9
                h-9
                rounded-full
                bg-red-100
                text-red-600
                flex
                items-center
                justify-center
                font-bold
              "
            >
              !
            </div>

            <div>

              <p
                className="
                  text-red-700
                  font-semibold
                  text-sm
                "
              >
                Failed to fetch products
              </p>


              <p
                className="
                  text-red-500
                  text-sm
                  mt-0.5
                "
              >
                {error}
              </p>

            </div>

          </div>

        )}


        {/* =================================================
            NO PRODUCTS
        ================================================= */}

        {!loading &&
          !error &&
          products.length === 0 && (

            <div
              className="
                text-center
                py-20
                border
                border-dashed
                border-slate-200
                rounded-2xl
                bg-white
              "
            >

              <div
                className="
                  mx-auto
                  mb-4
                  w-14
                  h-14
                  rounded-full
                  bg-indigo-50
                  text-indigo-500
                  flex
                  items-center
                  justify-center
                "
              >
                <Search size={22} />
              </div>

              <h2
                className="
                  text-lg
                  font-semibold
                  text-slate-800
                "
              >
                No products found
              </h2>


              <p
                className="
                  text-slate-500
                  mt-1.5
                  text-sm
                "
              >
                Try changing your filters.
              </p>

              <button
                onClick={handleClearFilters}
                className="
                  mt-5
                  inline-flex
                  items-center
                  gap-1.5
                  bg-gradient-to-r
                  from-indigo-600
                  to-violet-600
                  hover:from-indigo-700
                  hover:to-violet-700
                  text-white
                  font-semibold
                  text-sm
                  px-5
                  py-2.5
                  rounded-xl
                  transition
                "
              >
                <RotateCcw size={15} />
                Clear Filters
              </button>

            </div>

          )}


        {/* =================================================
            PRODUCTS
        ================================================= */}

        {!loading &&
          !error &&
          products.length > 0 && (

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-4
                gap-6
              "
            >

              {products.map(
                (product) => (

                  <div
                    key={product.id}
                    className="
                      group
                      rounded-xl
                      overflow-hidden
                      bg-white
                      border
                      border-slate-200
                      shadow-sm
                      transition
                      duration-200
                      hover:shadow-lg
                      hover:-translate-y-1
                      hover:border-indigo-200
                    "
                  >
                    <ProductCard
                      product={product}
                    />
                  </div>

                )
              )}

            </div>

          )}


        {/* =================================================
            PAGINATION
        ================================================= */}

        {!loading &&
          !error &&
          products.length > 0 && (

            <div
              className="
                flex
                justify-center
                items-center
                gap-4
                mt-12
              "
            >

              <button
                disabled={
                  currentPage === 1
                }
                onClick={() =>
                  setPage(page - 1)
                }
                className="
                  bg-white
                  border
                  border-slate-200
                  text-slate-700
                  font-medium
                  text-sm
                  px-4
                  py-2
                  rounded-xl
                  transition
                  hover:bg-slate-50
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                  disabled:hover:bg-white
                "
              >
                ← Previous
              </button>


              <span
                className="
                  text-slate-600
                  text-sm
                  font-medium
                  px-2
                "
              >
                Page {currentPage} of{" "}
                {totalPages}
              </span>


              <button
                disabled={
                  currentPage === totalPages
                }
                onClick={() =>
                  setPage(page + 1)
                }
                className="
                  bg-gradient-to-r
                  from-indigo-600
                  to-violet-600
                  text-white
                  font-medium
                  text-sm
                  px-4
                  py-2
                  rounded-xl
                  transition
                  hover:from-indigo-700
                  hover:to-violet-700
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                "
              >
                Next →
              </button>

            </div>

          )}

      </main>

    </>

  );

}


export default Inventory;



















