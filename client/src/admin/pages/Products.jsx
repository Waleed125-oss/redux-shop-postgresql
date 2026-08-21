
import { useEffect, useState } from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  deleteProduct,
  permanentlyDeleteProduct,
  fetchProducts,
  toggleProductStatus,
} from "../../store/slices/productSlice";

import { fetchCategories } from "../../store/slices/categorySlice";

import { Link, useLocation } from "react-router-dom";

import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaBoxOpen,
  FaFilter,
  FaSortAmountDown,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";


function Products() {

  const dispatch = useDispatch();

  const location = useLocation();

  const [page, setPage] = useState(
    location.state?.page || 1
  );

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [sort, setSort] =
    useState("");

  const [debouncedSearch, setDebouncedSearch] =
    useState("");


  // ================= PRODUCTS =================

  const {
    products,
    currentPage,
    totalPages,
    loading,
    error,
  } = useSelector(
    (state) => state.products
  );


  // ================= CATEGORIES =================

  const {
    categories,
    loading: categoryLoading,
  } = useSelector(
    (state) => state.categories
  );


  // ================= SEARCH DEBOUNCE =================

  useEffect(() => {

    const timer = setTimeout(() => {

      setDebouncedSearch(search);

    }, 500);


    return () =>
      clearTimeout(timer);

  }, [search]);


  // ================= FETCH CATEGORIES =================

  useEffect(() => {

    dispatch(fetchCategories());

  }, [dispatch]);


  // ================= FETCH PRODUCTS =================

  useEffect(() => {

    dispatch(
      fetchProducts({
        page,
        search: debouncedSearch,
        category_id: category,
        sort,
        admin: true,
      })
    );

  }, [
    dispatch,
    page,
    debouncedSearch,
    category,
    sort,
  ]);


  // ================= TOGGLE STATUS =================

  const handleToggleStatus = (id) => {

    dispatch(
      toggleProductStatus(id)
    );

  };

  // ================= PERMANENT DELETE =================

const handlePermanentDelete = async (product) => {

  const confirmed = window.confirm(
    `Are you sure you want to permanently delete "${product.title}"?\n\nThis action cannot be undone.`
  );

  if (!confirmed) {
    return;
  }

  try {

    await dispatch(
      permanentlyDeleteProduct(product.id)
    ).unwrap();

    alert("Product permanently deleted successfully.");

  } catch (error) {

    alert(
      error || "Cannot delete this product."
    );

  }

};

  return (

    <div className="space-y-6">


      {/* ================= HEADER ================= */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

        <div className="flex items-center gap-3">

          <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">

            <FaBoxOpen size={22} />

          </div>


          <div>

            <h1 className="text-3xl font-bold text-gray-800">

              Manage Products

            </h1>


            <p className="text-gray-500 mt-1">

              Manage your products, prices,
              categories and availability

            </p>

          </div>

        </div>


        <Link
          to="/admin/products/add"
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            bg-blue-600
            hover:bg-blue-700
            text-white
            font-semibold
            px-5
            py-3
            rounded-xl
            shadow-sm
            transition
            duration-200
            w-full
            lg:w-auto
          "
        >

          <FaPlus size={14} />

          Add Product

        </Link>

      </div>


      {/* ================= FILTERS ================= */}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">

        <div className="flex items-center gap-2 mb-4">

          <FaFilter className="text-blue-600" />

          <h2 className="font-semibold text-gray-800">

            Product Filters

          </h2>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">


          {/* SEARCH */}

          <div className="relative">

            <FaSearch
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-gray-400
              "
            />


            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => {

                setSearch(e.target.value);

                setPage(1);

              }}
              className="
                w-full
                pl-11
                pr-4
                py-3
                border
                border-gray-200
                rounded-xl
                outline-none
                text-gray-700
                placeholder-gray-400
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-100
                transition
              "
            />

          </div>


          {/* CATEGORY */}

          <select
            value={category}
            onChange={(e) => {

              setCategory(e.target.value);

              setPage(1);

            }}
            disabled={categoryLoading}
            className="
              w-full
              bg-white
              border
              border-gray-200
              rounded-xl
              px-4
              py-3
              text-gray-700
              outline-none
              cursor-pointer
              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-100
            "
          >

            <option value="">

              {categoryLoading
                ? "Loading Categories..."
                : "All Categories"}

            </option>


            {categories.map(
              (categoryItem) => (

                <option
                  key={categoryItem.id}
                  value={categoryItem.id}
                >

                  {categoryItem.name}

                </option>

              )
            )}

          </select>


          {/* SORT */}

          <div className="relative">

            <FaSortAmountDown
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-gray-400
                pointer-events-none
              "
            />


            <select
              value={sort}
              onChange={(e) => {

                setSort(e.target.value);

                setPage(1);

              }}
              className="
                w-full
                appearance-none
                bg-white
                border
                border-gray-200
                rounded-xl
                pl-11
                pr-4
                py-3
                text-gray-700
                outline-none
                cursor-pointer
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-100
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

              <option value="title_asc">
                Title: A → Z
              </option>

              <option value="title_desc">
                Title: Z → A
              </option>

            </select>

          </div>

        </div>

      </div>


      {/* ================= LOADING ================= */}

      {loading && (

        <div className="bg-blue-50 border border-blue-100 text-blue-600 rounded-xl p-4">

          <div className="flex items-center gap-3">

            <div
              className="
                w-5
                h-5
                border-2
                border-blue-600
                border-t-transparent
                rounded-full
                animate-spin
              "
            />

            <span className="font-medium">

              Loading products...

            </span>

          </div>

        </div>

      )}


      {/* ================= ERROR ================= */}

      {error && (

        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4">

          {error}

        </div>

      )}


      {/* ================= TABLE ================= */}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">


        {/* TABLE HEADER */}

        <div className="px-6 py-5 border-b border-gray-200">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

            <div>

              <h2 className="text-xl font-semibold text-gray-800">

                Product List

              </h2>


              <p className="text-sm text-gray-500 mt-1">

                Active and inactive products

              </p>

            </div>


            <div className="text-sm text-gray-500">

              Page {currentPage} of {totalPages}

            </div>

          </div>

        </div>


        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1050px]">

            <thead>

              <tr className="bg-gray-50 border-b border-gray-200">


                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">

                  Image

                </th>


                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">

                  Product

                </th>


                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">

                  Price

                </th>


                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">

                  Category

                </th>


                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">

                  Status

                </th>


                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">

                  Actions

                </th>

              </tr>

            </thead>


            <tbody>

              {products.map(
                (product) => (

                  <tr
                    key={product.id}
                    className="
                      border-b
                      last:border-b-0
                      hover:bg-gray-50
                      transition
                    "
                  >


                    {/* IMAGE */}

                    <td className="px-6 py-5">

                      <div
                        className="
                          w-16
                          h-16
                          bg-gray-100
                          rounded-xl
                          flex
                          items-center
                          justify-center
                          overflow-hidden
                          border
                          border-gray-200
                        "
                      >

                        <img
                          src={`${import.meta.env.VITE_API_URL}${product.image}`}
                          alt={product.title}
                          className="w-full h-full object-contain"
                        />

                      </div>

                    </td>


                    {/* PRODUCT */}

                    <td className="px-6 py-5">

                      <p className="font-semibold text-gray-800">

                        {product.title}

                      </p>


                      <p className="text-xs text-gray-400 mt-1">

                        Product #{product.id}

                      </p>

                    </td>


                    {/* PRICE */}

                    <td className="px-6 py-5">

                      <span className="font-semibold text-gray-800">

                        $
                        {Number(
                          product.price
                        ).toLocaleString()}

                      </span>

                    </td>


                    {/* CATEGORY */}

                    <td className="px-6 py-5">

                      <span
                        className="
                          inline-flex
                          px-3
                          py-1
                          rounded-full
                          text-xs
                          font-semibold
                          bg-blue-50
                          text-blue-600
                        "
                      >

                        {product.category}

                      </span>

                    </td>


                    {/* STATUS */}

                    <td className="px-6 py-5">

                      {product.is_active ? (

                        <span
                          className="
                            inline-flex
                            items-center
                            gap-2
                            px-3
                            py-1.5
                            rounded-full
                            text-xs
                            font-semibold
                            bg-green-50
                            text-green-600
                            border
                            border-green-100
                          "
                        >

                          <FaCheckCircle />

                          Active

                        </span>

                      ) : (

                        <span
                          className="
                            inline-flex
                            items-center
                            gap-2
                            px-3
                            py-1.5
                            rounded-full
                            text-xs
                            font-semibold
                            bg-gray-100
                            text-gray-500
                            border
                            border-gray-200
                          "
                        >

                          <FaTimesCircle />

                          Inactive

                        </span>

                      )}

                    </td>


                    {/* ACTIONS */}

                    {/* ACTIONS */}

<td className="px-6 py-5">

  <div className="flex justify-end items-center gap-2">

    {/* EDIT */}

    <Link
      to={`/admin/products/edit/${product.id}`}
      state={{ page }}
      className="
        inline-flex
        items-center
        gap-2
        px-3
        py-2
        rounded-lg
        bg-amber-50
        text-amber-600
        border
        border-amber-100
        hover:bg-amber-100
        transition
        font-medium
        text-sm
      "
    >

      <FaEdit size={13} />

      Edit

    </Link>


    {/* ACTIVATE / DEACTIVATE */}

    <button
      onClick={() =>
        handleToggleStatus(product.id)
      }
      className={`
        inline-flex
        items-center
        gap-2
        px-3
        py-2
        rounded-lg
        border
        transition
        font-medium
        text-sm

        ${
          product.is_active
            ? `
              bg-red-50
              text-red-600
              border-red-100
              hover:bg-red-100
            `
            : `
              bg-green-50
              text-green-600
              border-green-100
              hover:bg-green-100
            `
        }
      `}
    >

      {product.is_active ? (
        <>
          <FaTimesCircle size={13} />
          Deactivate
        </>
      ) : (
        <>
          <FaCheckCircle size={13} />
          Activate
        </>
      )}

    </button>


    {/* PERMANENT DELETE */}

    {!product.is_active && (

      <button
        onClick={() =>
          handlePermanentDelete(product)
        }
        className="
          inline-flex
          items-center
          gap-2
          px-3
          py-2
          rounded-lg
          bg-red-600
          text-white
          border
          border-red-600
          hover:bg-red-700
          transition
          font-medium
          text-sm
        "
      >

        <FaTrash size={13} />

        Delete Permanently

      </button>

    )}

  </div>

</td>

                  </tr>

                )
              )}


              {/* NO PRODUCTS */}

              {products.length === 0 &&
                !loading && (

                  <tr>

                    <td
                      colSpan="6"
                      className="text-center py-16"
                    >

                      <FaBoxOpen
                        className="mx-auto text-gray-300 mb-4"
                        size={45}
                      />


                      <p className="text-gray-500 font-medium">

                        No products found

                      </p>


                      <p className="text-sm text-gray-400 mt-1">

                        Try changing your search
                        or filters.

                      </p>

                    </td>

                  </tr>

                )}

            </tbody>

          </table>

        </div>

      </div>


      {/* ================= PAGINATION ================= */}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">


        <p className="text-sm text-gray-500">

          Page{" "}

          <span className="font-semibold text-gray-700">

            {currentPage}

          </span>{" "}

          of{" "}

          <span className="font-semibold text-gray-700">

            {totalPages}

          </span>

        </p>


        <div className="flex items-center gap-3">


          <button
            onClick={() =>
              setPage(page - 1)
            }
            disabled={page === 1}
            className="
              px-4
              py-2
              rounded-lg
              border
              border-gray-200
              bg-white
              text-gray-600
              font-medium
              hover:bg-gray-50
              disabled:opacity-40
              disabled:cursor-not-allowed
              transition
            "
          >

            Previous

          </button>


          <div
            className="
              px-4
              py-2
              rounded-lg
              bg-blue-600
              text-white
              font-semibold
            "
          >

            {currentPage}

          </div>


          <button
            onClick={() =>
              setPage(page + 1)
            }
            disabled={
              page === totalPages
            }
            className="
              px-4
              py-2
              rounded-lg
              bg-blue-600
              text-white
              font-medium
              hover:bg-blue-700
              disabled:opacity-40
              disabled:cursor-not-allowed
              transition
            "
          >

            Next

          </button>

        </div>

      </div>

    </div>
  );
}


export default Products;