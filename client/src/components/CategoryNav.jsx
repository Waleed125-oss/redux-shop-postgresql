import { useSelector } from "react-redux";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaChevronDown,
  FaHome,
  FaSortAmountDown,
} from "react-icons/fa";


// =====================================================
// CATEGORY ITEM
// =====================================================

function CategoryItem({
  category,
  categories,
  openPath,
  setOpenPath,
  level = 0,
}) {

  const navigate = useNavigate();

  const children = categories.filter(
    (child) =>
      String(child.parent_id) ===
      String(category.id)
  );

  const hasChildren = children.length > 0;

  const isOpen =
    openPath[level] === category.id;


  // ===================================================
  // OPEN MENU
  // ===================================================

  const openMenu = () => {

    if (!hasChildren) {
      return;
    }

    setOpenPath([
      ...openPath.slice(0, level),
      category.id,
    ]);
  };


  // ===================================================
  // CATEGORY CLICK
  // ===================================================

  const handleClick = () => {

    /*
      IMPORTANT:

      Category clicks now go to the Inventory page.

      Example:

      Books → /inventory?category=5
      Mobiles → /inventory?category=8
      Samsung → /inventory?category=12

      The Inventory page will read the category
      from the URL and send it to the backend.
    */

    navigate(
      `/inventory?category=${category.id}`
    );


    // Keep dropdown behavior
    if (hasChildren) {

      setOpenPath([
        ...openPath.slice(0, level),
        category.id,
      ]);

    } else {

      setOpenPath([]);

    }

  };


  return (

    <div
      className={
        level === 0
          ? "relative h-full flex items-center"
          : "relative"
      }
      onMouseEnter={openMenu}
    >

      {/* =================================================
          CATEGORY BUTTON
      ================================================= */}

      <button
        onClick={handleClick}
        className={`
          flex
          items-center
          justify-between
          gap-2
          font-semibold
          text-sm
          whitespace-nowrap
          transition-all
          duration-200
          group

          ${
            level === 0
              ? `
                px-5
                h-10
                rounded-full

                ${
                  isOpen
                    ? `
                      text-white
                      bg-gradient-to-r
                      from-blue-600
                      to-indigo-600
                      shadow-md
                      shadow-blue-600/30
                    `
                    : `
                      text-gray-300
                      hover:text-white
                      hover:bg-gradient-to-r
                      hover:from-blue-600
                      hover:to-indigo-600
                      hover:shadow-md
                      hover:shadow-blue-600/30
                    `
                }
              `
              : `
                w-full
                px-5
                py-3
                text-left
                text-gray-300
                hover:text-white
                hover:bg-white/10
              `
          }
        `}
      >

        <span>
          {category.name}
        </span>


        {/* CHEVRON */}

        {hasChildren && (

          <FaChevronDown
            size={9}
            className={`
              shrink-0
              transition-transform
              duration-200

              ${
                isOpen
                  ? "rotate-180 text-blue-400"
                  : "text-gray-500"
              }

              group-hover:text-blue-400
            `}
          />

        )}

      </button>


      {/* =================================================
          DROPDOWN
      ================================================= */}

      {hasChildren && isOpen && (

        <div
          className={`
            absolute

            ${
              level === 0
                ? "top-[calc(100%-1px)] left-0"
                : "top-0 left-full"
            }

            w-64

            bg-gray-950

            border
            border-white/10

            rounded-2xl

            shadow-2xl
            shadow-black/50

            ring-1
            ring-white/5

            py-2

            z-[60]

            overflow-visible
          `}
        >

          {/* =================================================
              DROPDOWN HEADER
          ================================================= */}

          <div
            className="
              px-5
              py-3
              border-b
              border-white/10
              bg-white/[0.03]
            "
          >

            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-wider
                text-blue-400
              "
            >
              {category.name}
            </p>

            <p
              className="
                text-xs
                text-gray-500
                mt-1
              "
            >
              Browse categories
            </p>

          </div>


          {/* =================================================
              CHILDREN
          ================================================= */}

          {children.map((child) => (

            <CategoryItem
              key={child.id}
              category={child}
              categories={categories}
              openPath={openPath}
              setOpenPath={setOpenPath}
              level={level + 1}
            />

          ))}

        </div>

      )}

    </div>
  );
}


// =====================================================
// MAIN CATEGORY NAV
// =====================================================

function CategoryNav({
  sort,
  onSortChange,
}) {

  const navigate = useNavigate();

  const {
    categories = [],
  } = useSelector(
    (state) => state.categories
  );


  // ===================================================
  // OPEN CATEGORY PATH
  // ===================================================

  const [
    openPath,
    setOpenPath,
  ] = useState([]);


  // ===================================================
  // MAIN / PARENT CATEGORIES
  // ===================================================

  const parentCategories =
    categories.filter(
      (category) =>
        !category.parent_id
    );


  // ===================================================
  // HOME
  // ===================================================

  const handleHomeClick = () => {

    navigate("/");

    setOpenPath([]);

  };


  return (

    <div
      onMouseLeave={() => setOpenPath([])}
      className="
        relative
        z-40
        bg-gray-950
        border-b
        border-white/10
        sticky
        top-0
        overflow-visible
      "
    >

      {/* =================================================
          TOP GRADIENT LINE
      ================================================= */}

      <div
        className="
          h-[3px]
          w-full
          bg-gradient-to-r
          from-blue-600
          via-indigo-600
          to-violet-600
        "
      />


      {/* =================================================
          NAV CONTAINER
      ================================================= */}

      <div
        className="
          max-w-7xl
          mx-auto
          px-6
          overflow-visible
        "
      >

        <div
          className="
            flex
            items-center
            gap-1.5
            h-16
            overflow-visible
          "
        >

          {/* =================================================
              HOME
          ================================================= */}

          <button
            onClick={handleHomeClick}
            className="
              flex
              items-center
              gap-2
              px-5
              h-10
              rounded-full
              font-semibold
              text-sm
              text-gray-300
              whitespace-nowrap
              hover:text-white
              hover:bg-white/10
              transition-all
              duration-200
              group
              shrink-0
            "
          >

            <FaHome
              size={13}
              className="
                text-gray-500
                group-hover:text-blue-400
                transition-colors
                duration-200
              "
            />

            Home

          </button>


          {/* =================================================
              DIVIDER
          ================================================= */}

          <span
            className="
              h-6
              w-px
              bg-white/10
              mx-1
              shrink-0
            "
          />


          {/* =================================================
              MAIN CATEGORIES
          ================================================= */}

          <div className="flex items-center gap-1.5 flex-1">

            {parentCategories.map(
              (category) => (

                <CategoryItem
                  key={category.id}
                  category={category}
                  categories={categories}
                  openPath={openPath}
                  setOpenPath={setOpenPath}
                  level={0}
                />

              )
            )}

          </div>


          {/* =================================================
              SORTING
          ================================================= */}

          <div
            className="
              relative
              flex
              items-center
              shrink-0
              ml-auto
            "
          >

            <FaSortAmountDown
              className="
                absolute
                left-3
                text-gray-400
                pointer-events-none
                text-xs
              "
            />

            <select
              value={sort}
              onChange={(e) =>
                onSortChange(e.target.value)
              }
              className="
                appearance-none
                bg-gray-900
                border
                border-white/10
                text-gray-300
                text-sm
                font-medium
                rounded-full
                pl-9
                pr-8
                py-2.5
                outline-none
                cursor-pointer
                hover:border-blue-500/50
                focus:border-blue-500
                transition
              "
            >

              <option
                value=""
                className="bg-gray-900"
              >
                Default Sorting
              </option>

              <option
                value="price_asc"
                className="bg-gray-900"
              >
                Price: Low → High
              </option>

              <option
                value="price_desc"
                className="bg-gray-900"
              >
                Price: High → Low
              </option>

              <option
                value="title_asc"
                className="bg-gray-900"
              >
                Title: A → Z
              </option>

              <option
                value="title_desc"
                className="bg-gray-900"
              >
                Title: Z → A
              </option>

            </select>

          </div>

        </div>

      </div>

    </div>
  );
}

export default CategoryNav;