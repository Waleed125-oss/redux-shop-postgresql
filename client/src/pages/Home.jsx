// import ProductTabs from "../components/ProductTabs";
// import CategoryNav from "../components/CategoryNav";
// import ProductCard from "../components/ProductCard";

// import { useEffect, useState } from "react";

// import {
//   useDispatch,
//   useSelector,
// } from "react-redux";

// import {
//   useSearchParams,
// } from "react-router-dom";

// import Navbar from "../components/Navbar";
// import Hero from "../components/Hero";

// import {
//   fetchProducts,
// } from "../store/slices/productSlice";

// import {
//   fetchCategories,
// } from "../store/slices/categorySlice";


// function Home() {

//   const dispatch = useDispatch();

//   const [searchParams, setSearchParams] =
//     useSearchParams();


//   // =====================================================
//   // PAGE
//   // =====================================================

//   const [page, setPage] =
//     useState(1);


//   // =====================================================
//   // CATEGORY FROM URL
//   // =====================================================

//   const selectedCategory =
//     searchParams.get("category") || "";


//   // =====================================================
//   // SORT
//   // =====================================================

//   const [sort, setSort] =
//     useState("");


//   // =====================================================
//   // PRODUCTS
//   // =====================================================

//   const {
//     products,
//     loading,
//     error,
//     currentPage,
//     totalPages,
//   } = useSelector(
//     (state) => state.products
//   );


//   // =====================================================
//   // SEARCH
//   // =====================================================

//   const search =
//     useSelector(
//       (state) => state.search.search
//     );


//   // =====================================================
//   // FETCH CATEGORIES
//   // =====================================================

//   useEffect(() => {

//     dispatch(
//       fetchCategories()
//     );

//   }, [dispatch]);


//   // =====================================================
//   // FETCH PRODUCTS
//   // =====================================================

//   useEffect(() => {

//     dispatch(
//       fetchProducts({
//         page,
//         limit: 12,
//         search,
//         category_id: selectedCategory,
//         sort,
//       })
//     );

//   }, [
//     dispatch,
//     page,
//     search,
//     selectedCategory,
//     sort,
//   ]);


//   // =====================================================
//   // CATEGORY SELECT
//   // =====================================================

//   const handleCategorySelect =
//     (categoryId) => {

//       setPage(1);

//       if (categoryId) {

//         setSearchParams({
//           category: categoryId,
//         });

//       } else {

//         setSearchParams({});

//       }

//     };


//   // =====================================================
//   // SORT CHANGE
//   // =====================================================

//   const handleSortChange =
//     (sortValue) => {

//       setSort(sortValue);

//       // Always go back to first page
//       // when sorting changes.

//       setPage(1);

//     };


//   return (

//     <>

//       <Navbar />

//       <Hero />


//       {/* =================================================
//           CATEGORY NAVIGATION + SORTING
//       ================================================= */}

//       <CategoryNav
//         onCategorySelect={
//           handleCategorySelect
//         }
//         sort={sort}
//         onSortChange={
//           handleSortChange
//         }
//       />


//       {/* <CategoryNav
//         onCategorySelect={handleCategorySelect}
//         sort={sort}
//         onSortChange={setSort}
//       /> */}

//       <ProductTabs products={products} />


//       {/* =================================================
//           PRODUCTS
//       ================================================= */}

//       <div className="max-w-7xl mx-auto p-6">


//         <h2 className="text-3xl font-bold mb-6">

//           Latest Products

//         </h2>


//         {/* LOADING */}

//         {loading && (

//           <h2>
//             Loading...
//           </h2>

//         )}


//         {/* ERROR */}

//         {error && (

//           <h2 className="text-red-500">

//             {error}

//           </h2>

//         )}


//         {/* PRODUCTS */}

//         {!loading && (

//           <div
//             className="
//               grid
//               grid-cols-1
//               sm:grid-cols-2
//               lg:grid-cols-4
//               gap-6
//             "
//           >

//             {products.map(
//               (product) => (

//                 <ProductCard
//                   key={product.id}
//                   product={product}
//                 />

//               )
//             )}

//           </div>

//         )}


//         {/* =================================================
//             PAGINATION
//         ================================================= */}

//         <div
//           className="
//             flex
//             justify-center
//             items-center
//             gap-4
//             mt-10
//           "
//         >

//           <button
//             disabled={
//               currentPage === 1
//             }
//             onClick={() =>
//               setPage(page - 1)
//             }
//             className="
//               bg-gray-300
//               px-4
//               py-2
//               rounded
//               disabled:opacity-50
//             "
//           >

//             Previous

//           </button>


//           <span>

//             Page {currentPage} of {totalPages}

//           </span>


//           <button
//             disabled={
//               currentPage === totalPages
//             }
//             onClick={() =>
//               setPage(page + 1)
//             }
//             className="
//               bg-blue-600
//               text-white
//               px-4
//               py-2
//               rounded
//               disabled:opacity-50
//             "
//           >

//             Next

//           </button>

//         </div>


//       </div>

//     </>

//   );
// }


// export default Home;









import ProductTabs from "../components/ProductTabs";
import CategoryNav from "../components/CategoryNav";
import ProductCard from "../components/ProductCard";

import { useEffect, useState } from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  useSearchParams,
} from "react-router-dom";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";

import {
  fetchProducts,
  fetchHomeSections,
} from "../store/slices/productSlice";

import {
  fetchCategories,
} from "../store/slices/categorySlice";


function Home() {

  const dispatch = useDispatch();

  const [searchParams, setSearchParams] =
    useSearchParams();


  // =====================================================
  // PAGE
  // =====================================================

  const [page, setPage] = useState(1);


  // =====================================================
  // CATEGORY FROM URL
  // =====================================================

  const selectedCategory =
    searchParams.get("category") || "";


  // =====================================================
  // SORT
  // =====================================================

  const [sort, setSort] = useState("");


  // =====================================================
  // PRODUCTS STATE
  // =====================================================

  const {
    products,
    loading,
    error,
    currentPage,
    totalPages,
  } = useSelector(
    (state) => state.products
  );


  // =====================================================
  // SEARCH
  // =====================================================

  const search =
    useSelector(
      (state) => state.search.search
    );


  // =====================================================
  // FETCH CATEGORIES
  // =====================================================

  useEffect(() => {

    dispatch(fetchCategories());

  }, [dispatch]);


  // =====================================================
  // FETCH HOME SECTIONS
  // =====================================================
  //
  // Backend endpoint:
  //
  // GET /api/products/home/sections
  //
  // ProductTabs.jsx reads the resulting data
  // directly from Redux.
  //
  // =====================================================

  useEffect(() => {

    dispatch(fetchHomeSections());

  }, [dispatch]);


  // =====================================================
  // FETCH LATEST / FILTERED PRODUCTS
  // =====================================================
  //
  // This endpoint handles:
  //
  // - Search
  // - Category
  // - Sorting
  // - Pagination
  //
  // =====================================================

  useEffect(() => {

    dispatch(
      fetchProducts({
        page,
        limit: 12,
        search,
        category_id: selectedCategory,
        sort,
      })
    );

  }, [
    dispatch,
    page,
    search,
    selectedCategory,
    sort,
  ]);


  // =====================================================
  // CATEGORY SELECT
  // =====================================================

  const handleCategorySelect =
    (categoryId) => {

      // Reset pagination
      setPage(1);

      if (categoryId) {

        setSearchParams({
          category: categoryId,
        });

      } else {

        setSearchParams({});

      }

    };


  // =====================================================
  // SORT CHANGE
  // =====================================================

  const handleSortChange =
    (sortValue) => {

      setSort(sortValue);

      // Reset pagination when sorting changes
      setPage(1);

    };


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
          HERO
      ================================================= */}

      <Hero />


      {/* =================================================
          CATEGORY NAVIGATION
      ================================================= */}

      <CategoryNav
        onCategorySelect={
          handleCategorySelect
        }
        sort={sort}
        onSortChange={
          handleSortChange
        }
      />


      {/* =================================================
          HOME PRODUCT TABS
      =================================================
      
      ProductTabs gets:

      bestSellers
      topRated
      newArrivals

      directly from Redux using useSelector().

      Therefore we DON'T pass any props here.

      ================================================= */}

      <ProductTabs />


      {/* =================================================
          LATEST PRODUCTS
      ================================================= */}

      <div className="max-w-7xl mx-auto p-6">

        <section>

          <h2 className="text-3xl font-bold mb-6">
            Latest Products
          </h2>


          {/* =================================================
              PRODUCTS LOADING
          ================================================= */}

          {loading && (

            <h2>
              Loading...
            </h2>

          )}


          {/* =================================================
              PRODUCTS ERROR
          ================================================= */}

          {error && (

            <h2 className="text-red-500">
              {error}
            </h2>

          )}


          {/* =================================================
              PRODUCTS
          ================================================= */}

          {!loading && !error && (

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

                  <ProductCard
                    key={product.id}
                    product={product}
                  />

                )
              )}

            </div>

          )}


          {/* =================================================
              PAGINATION
          ================================================= */}

          <div
            className="
              flex
              justify-center
              items-center
              gap-4
              mt-10
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
                bg-gray-300
                px-4
                py-2
                rounded
                disabled:opacity-50
              "
            >

              Previous

            </button>


            <span>
              Page {currentPage} of {totalPages}
            </span>


            <button
              disabled={
                currentPage === totalPages
              }
              onClick={() =>
                setPage(page + 1)
              }
              className="
                bg-blue-600
                text-white
                px-4
                py-2
                rounded
                disabled:opacity-50
              "
            >

              Next

            </button>

          </div>

        </section>

      </div>

    </>

  );

}


export default Home;