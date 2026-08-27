import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaChevronDown,
  FaHome,
  FaSortAmountDown,
  FaStore,
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
  const buttonRef = useRef(null);
  const [mobileMenuPosition, setMobileMenuPosition] =
    useState(null);

  const children = categories.filter(
    (child) =>
      String(child.parent_id) === String(category.id)
  );

  const hasChildren = children.length > 0;

  const isOpen =
    openPath[level] === category.id;

  useEffect(() => {
    if (level !== 0 || !isOpen || !buttonRef.current) {
      return undefined;
    }

    const updateMobileMenuPosition = () => {
      const buttonBounds =
        buttonRef.current.getBoundingClientRect();
      const menuWidth = window.innerWidth < 640 ? 224 : 256;
      const left = Math.max(
        8,
        Math.min(
          buttonBounds.left,
          window.innerWidth - menuWidth - 8
        )
      );

      setMobileMenuPosition({
        top: buttonBounds.bottom,
        left,
      });
    };

    updateMobileMenuPosition();
    window.addEventListener(
      "resize",
      updateMobileMenuPosition
    );
    window.addEventListener(
      "scroll",
      updateMobileMenuPosition,
      true
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateMobileMenuPosition
      );
      window.removeEventListener(
        "scroll",
        updateMobileMenuPosition,
        true
      );
    };
  }, [isOpen, level]);

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
    navigate(`/inventory?category=${category.id}`);

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
          ? "relative h-full flex items-center shrink-0"
          : "relative"
      }
      onMouseEnter={openMenu}
    >
      {/* =================================================
          CATEGORY BUTTON
      ================================================= */}

      <button
        ref={buttonRef}
        onClick={handleClick}
        className={`
          flex
          items-center
          justify-between
          gap-2
          font-semibold
          text-xs
          sm:text-sm
          whitespace-nowrap
          transition-all
          duration-200
          group

          ${
            level === 0
              ? `
                px-3
                sm:px-4
                lg:px-5

                h-9
                sm:h-10

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
                px-4
                sm:px-5
                py-3
                text-left
                text-gray-300
                hover:text-white
                hover:bg-white/10
              `
          }
        `}
      >
        <span>{category.name}</span>

        {/* CHEVRON */}

        {hasChildren && (
          <FaChevronDown
            size={8}
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
            ${
              level === 0
                ? "fixed"
                : "absolute top-0 left-full"
            }

            w-56
            sm:w-64

            max-w-[calc(100vw-1rem)]

            bg-gray-950

            border
            border-white/10

            rounded-xl
            sm:rounded-2xl

            shadow-2xl
            shadow-black/50

            ring-1
            ring-white/5

            py-2

            z-[60]

            overflow-visible
          `}
          style={
            level === 0 && mobileMenuPosition
              ? {
                  top: `${mobileMenuPosition.top}px`,
                  left: `${mobileMenuPosition.left}px`,
                }
              : undefined
          }
        >
          {/* =================================================
              DROPDOWN HEADER
          ================================================= */}

          <div
            className="
              px-4
              sm:px-5
              py-3
              border-b
              border-white/10
              bg-white/[0.03]
            "
          >
            <p
              className="
                text-[10px]
                sm:text-xs
                font-bold
                uppercase
                tracking-wider
                text-blue-400
                truncate
              "
            >
              {category.name}
            </p>

            <p
              className="
                text-[10px]
                sm:text-xs
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

  // ===================================================
  // SHOP BY SELLER
  // ===================================================

  const handleShopBySeller = () => {
    navigate("/shop/sellers");
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
          h-[2px]
          sm:h-[3px]
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
          px-2
          sm:px-4
          lg:px-6
          overflow-visible
        "
      >
        {/* =================================================
            MOBILE/TABLET SCROLL CONTAINER
        ================================================= */}

        <div
          className="
            flex
            items-center
            gap-1
            sm:gap-1.5
            h-14
            sm:h-16
            overflow-x-auto
            overflow-y-visible
            scrollbar-hide
            whitespace-nowrap
          "
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {/* =================================================
              HOME
          ================================================= */}

          <button
            onClick={handleHomeClick}
            className="
              flex
              items-center
              gap-1.5
              sm:gap-2

              px-3
              sm:px-4
              lg:px-5

              h-9
              sm:h-10

              rounded-full

              font-semibold

              text-xs
              sm:text-sm

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
              size={12}
              className="
                sm:w-[13px]
                sm:h-[13px]

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
              h-5
              sm:h-6
              w-px
              bg-white/10
              mx-0.5
              sm:mx-1
              shrink-0
            "
          />

          {/* =================================================
              MAIN CATEGORIES
          ================================================= */}

          <div
            className="
              flex
              items-center
              gap-1
              sm:gap-1.5
              flex-1
              min-w-max
            "
          >
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

            {/* =================================================
                SHOP BY SELLER
            ================================================= */}

            <button
              onClick={handleShopBySeller}
              className="
                flex
                items-center
                gap-1.5
                sm:gap-2

                px-3
                sm:px-4
                lg:px-5

                h-9
                sm:h-10

                rounded-full

                font-semibold

                text-xs
                sm:text-sm

                text-gray-300

                whitespace-nowrap

                hover:text-white

                hover:bg-gradient-to-r
                hover:from-blue-600
                hover:to-indigo-600

                hover:shadow-md
                hover:shadow-blue-600/30

                transition-all
                duration-200

                group
                shrink-0
              "
            >
              <FaStore
                size={12}
                className="
                  sm:w-[13px]
                  sm:h-[13px]

                  text-gray-500
                  group-hover:text-blue-400

                  transition-colors
                  duration-200
                "
              />

              Shop by Seller
            </button>
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
              ml-1
              sm:ml-auto

              bg-gray-950
            "
          >
            <FaSortAmountDown
              className="
                absolute
                left-2.5
                sm:left-3

                text-gray-400
                pointer-events-none

                text-[10px]
                sm:text-xs
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

                text-xs
                sm:text-sm

                font-medium

                rounded-full

                pl-8
                sm:pl-9

                pr-7
                sm:pr-8

                py-2
                sm:py-2.5

                outline-none

                cursor-pointer

                hover:border-blue-500/50
                focus:border-blue-500

                transition

                max-w-[145px]
                sm:max-w-none
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
