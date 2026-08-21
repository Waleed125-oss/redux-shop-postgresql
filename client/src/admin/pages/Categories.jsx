
import { useEffect, useState } from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../store/slices/categorySlice";

import {
  FaTags,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaLayerGroup,
} from "react-icons/fa";

function Categories() {
  const dispatch = useDispatch();

  const {
    categories,
    loading,
  } = useSelector(
    (state) => state.categories
  );

  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [editingId, setEditingId] = useState(null);

  // ================= FETCH CATEGORIES =================

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // ================= SUBMIT =================

const handleSubmit = (e) => {
  e.preventDefault();

  if (name.trim() === "") return;

  const categoryData = {
    name: name.trim(),
    parent_id: parentId || null,
  };

  if (editingId) {

    dispatch(
      updateCategory({
        id: editingId,
        categoryData,
      })
    );

  } else {

    dispatch(
      createCategory(categoryData)
    );

  }

  setName("");
  setParentId("");
  setEditingId(null);
};

  // ================= EDIT =================

  const handleEdit = (category) => {
    setEditingId(category.id);
    setName(category.name);

    setParentId(
      category.parent_id
      ? String(category.parent_id)
      : ""
    );
  };

  // ================= CANCEL EDIT =================

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setParentId("")
  };

  // ================= DELETE =================

  const handleDelete = (id) => {
    dispatch(deleteCategory(id));
  };

  return (
    <div className="space-y-6">

      {/* ================= PAGE HEADER ================= */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div className="flex items-center gap-4">

          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-100 text-blue-600">
            <FaTags size={24} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Categories
            </h1>

            <p className="text-gray-500 mt-1">
              Organize your products into categories
            </p>
          </div>

        </div>

        {/* CATEGORY COUNT */}

        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">

          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 text-blue-600">
            <FaLayerGroup size={16} />
          </div>

          <div>
            <p className="text-xs text-gray-400">
              Total Categories
            </p>

            <p className="text-lg font-bold text-gray-800">
              {categories.length}
            </p>
          </div>

        </div>

      </div>


      {/* ================= CATEGORY FORM ================= */}

      <div
        className={`
          bg-white
          rounded-2xl
          border
          shadow-sm
          p-5
          transition
          ${
            editingId
              ? "border-amber-200 bg-amber-50/30"
              : "border-gray-200"
          }
        `}
      >

        <div className="flex items-center gap-3 mb-4">

          <div
            className={`
              flex
              items-center
              justify-center
              w-10
              h-10
              rounded-xl
              ${
                editingId
                  ? "bg-amber-100 text-amber-600"
                  : "bg-blue-100 text-blue-600"
              }
            `}
          >
            {editingId ? (
              <FaEdit size={17} />
            ) : (
              <FaPlus size={17} />
            )}
          </div>

          <div>
            <h2 className="font-semibold text-gray-800">
              {editingId
                ? "Edit Category"
                : "Add New Category"}
            </h2>

            <p className="text-sm text-gray-400">
              {editingId
                ? "Update the category name below"
                : "Create a new product category"}
            </p>
          </div>

        </div>


        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-3"
        >

          {/* INPUT */}

          <div className="relative flex-1">

            <FaTags
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
              value={name}
              placeholder="Enter category name..."
              onChange={(e) =>
                setName(e.target.value)
              }
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

           {/* ================= PARENT CATEGORY ================= */}

<div className="relative flex-1">

  <select
    value={parentId}
    onChange={(e) => setParentId(e.target.value)}
    className="
      w-full
      px-4
      py-3
      border
      border-gray-200
      rounded-xl
      outline-none
      text-gray-700
      bg-white
      focus:border-blue-500
      focus:ring-2
      focus:ring-blue-100
      transition
    "
  >

    <option value="">
      No Parent Category
    </option>

    {categories
      .filter(
        (category) =>
          category.id !== editingId
      )
      .map((category) => (

        <option
          key={category.id}
          value={category.id}
        >
          {category.name}
        </option>

      ))}

  </select>

</div>
          {/* SUBMIT */}

          <button
            type="submit"
            disabled={loading || name.trim() === ""}
            className={`
              inline-flex
              items-center
              justify-center
              gap-2
              px-6
              py-3
              rounded-xl
              text-white
              font-semibold
              transition
              duration-200
              disabled:opacity-50
              disabled:cursor-not-allowed
              ${
                editingId
                  ? "bg-amber-500 hover:bg-amber-600"
                  : "bg-blue-600 hover:bg-blue-700"
              }
            `}
          >

            {editingId ? (
              <>
                <FaSave size={14} />
                Update Category
              </>
            ) : (
              <>
                <FaPlus size={14} />
                Add Category
              </>
            )}

          </button>


          {/* CANCEL */}

          {editingId && (

            <button
              type="button"
              onClick={handleCancelEdit}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                px-5
                py-3
                rounded-xl
                border
                border-gray-200
                bg-white
                text-gray-600
                font-semibold
                hover:bg-gray-50
                transition
              "
            >
              <FaTimes size={14} />
              Cancel
            </button>

          )}

        </form>

      </div>


      {/* ================= LOADING ================= */}

      {loading && (

        <div className="
          flex
          items-center
          gap-3
          bg-blue-50
          border
          border-blue-100
          text-blue-600
          rounded-xl
          px-5
          py-4
        ">

          <div className="
            w-5
            h-5
            border-2
            border-blue-600
            border-t-transparent
            rounded-full
            animate-spin
          " />

          <span className="font-medium">
            Processing categories...
          </span>

        </div>

      )}


      {/* ================= CATEGORY TABLE ================= */}

      <div className="
        bg-white
        rounded-2xl
        border
        border-gray-200
        shadow-sm
        overflow-hidden
      ">

        {/* TABLE HEADER */}

        <div className="
          px-6
          py-5
          border-b
          border-gray-200
          flex
          flex-col
          sm:flex-row
          sm:items-center
          sm:justify-between
          gap-2
        ">

          <div>

            <h2 className="text-xl font-semibold text-gray-800">
              Category List
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              All product categories in your store
            </p>

          </div>

          <span className="
            inline-flex
            items-center
            gap-2
            w-fit
            px-3
            py-1.5
            rounded-lg
            bg-blue-50
            text-blue-600
            text-sm
            font-semibold
          ">
            <FaTags size={12} />
            {categories.length} Categories
          </span>

        </div>


        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[650px]">

            <thead>

          <tr className="bg-gray-50 border-b border-gray-200">

  <th className="
    px-6
    py-4
    text-left
    text-sm
    font-semibold
    text-gray-500
    w-24
  ">
    ID
  </th>

  <th className="
    px-6
    py-4
    text-left
    text-sm
    font-semibold
    text-gray-500
  ">
    Category
  </th>

  <th className="
    px-6
    py-4
    text-left
    text-sm
    font-semibold
    text-gray-500
  ">
    Parent Category
  </th>

  <th className="
    px-6
    py-4
    text-right
    text-sm
    font-semibold
    text-gray-500
  ">
    Actions
  </th>

</tr>

            </thead>


            <tbody>

  {categories.map((category) => (

    <tr
      key={category.id}
      className={`
        border-b
        last:border-b-0
        transition
        duration-150
        ${
          editingId === category.id
            ? "bg-amber-50/50"
            : "hover:bg-gray-50"
        }
      `}
    >

      {/* ID */}

      <td className="px-6 py-5">

        <span className="
          inline-flex
          items-center
          justify-center
          min-w-10
          h-8
          px-2
          rounded-lg
          bg-gray-100
          text-gray-600
          text-sm
          font-semibold
        ">
          #{category.id}
        </span>

      </td>


      {/* NAME */}

      <td className="px-6 py-5">

        <div className="flex items-center gap-3">

          <div className="
            flex
            items-center
            justify-center
            w-10
            h-10
            rounded-xl
            bg-blue-50
            text-blue-600
          ">
            <FaTags size={15} />
          </div>

          <div>

            <p className="font-semibold text-gray-800">
              {category.name}
            </p>

            <p className="text-xs text-gray-400 mt-0.5">
              Product category
            </p>

          </div>

        </div>

      </td>


      {/* ================= PARENT CATEGORY ================= */}

      <td className="px-6 py-5">

        {category.parent_name ? (

          <span className="
            inline-flex
            items-center
            px-3
            py-1.5
            rounded-lg
            bg-purple-50
            text-purple-600
            text-sm
            font-medium
          ">
            {category.parent_name}
          </span>

        ) : (

          <span className="
            text-sm
            text-gray-400
          ">
            Main Category
          </span>

        )}

      </td>


      {/* ACTIONS */}

      <td className="px-6 py-5">

        <div className="flex justify-end items-center gap-2">

          {/* EDIT */}

          <button
            onClick={() =>
              handleEdit(category)
            }
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
              duration-200
              font-medium
              text-sm
            "
          >
            <FaEdit size={13} />
            Edit
          </button>


          {/* DELETE */}

          <button
            onClick={() =>
              handleDelete(category.id)
            }
            className="
              inline-flex
              items-center
              gap-2
              px-3
              py-2
              rounded-lg
              bg-red-50
              text-red-600
              border
              border-red-100
              hover:bg-red-100
              transition
              duration-200
              font-medium
              text-sm
            "
          >
            <FaTrash size={13} />
            Delete
          </button>

        </div>

      </td>

    </tr>

  ))}


  {/* ================= EMPTY STATE ================= */}

  {categories.length === 0 && !loading && (

    <tr>

      <td
        colSpan="4"
        className="py-16 text-center"
      >

        <div className="
          flex
          flex-col
          items-center
        ">

          <div className="
            flex
            items-center
            justify-center
            w-16
            h-16
            rounded-2xl
            bg-gray-100
            text-gray-400
            mb-4
          ">
            <FaTags size={25} />
          </div>

          <p className="
            text-gray-600
            font-semibold
          ">
            No categories found
          </p>

          <p className="
            text-sm
            text-gray-400
            mt-1
          ">
            Create your first category above.
          </p>

        </div>

      </td>

    </tr>

  )}

</tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Categories;